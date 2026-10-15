import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:net';

// Teste explícito e isolado. Não conecta a bancos de produção.
const moduleRoot = process.env.GESTAO_TEST_MODULES || path.resolve('node_modules');
const pgBin = process.env.PG_BIN;
const php = process.env.PHP_BIN || 'php';
const phpArgs = process.platform === 'win32' ? ['-d', `extension_dir=${path.join(path.dirname(php), 'ext')}`, '-d', 'extension=php_pdo_pgsql.dll'] : [];
const root = path.resolve('.');
async function freePort() { const s = createServer(); await new Promise(resolve => s.listen(0, '127.0.0.1', resolve)); const p = s.address().port; await new Promise(resolve => s.close(resolve)); return p; }
const temporary = await mkdtemp(path.join(tmpdir(), 'gestao-integration-'));
let db;
let socket, server;
let nativeStarted = false;
let passed = 0;
function check(value, message) { assert.ok(value, message); passed++; }
try {
  const dbPort = await freePort(), httpPort = await freePort();
  if (pgBin) {
    const pg = (await import(pathToFileURL(path.join(moduleRoot, 'pg/lib/index.js')))).default;
    execFileSync(path.join(pgBin, 'initdb.exe'), ['-D', path.join(temporary,'data'), '-U','postgres','-A','trust','--encoding=UTF8','--locale=C'], {windowsHide:true,stdio:'pipe'});
    execFileSync(path.join(pgBin, 'pg_ctl.exe'), ['-D',path.join(temporary,'data'),'-l',path.join(temporary,'postgres.log'),'-o',`-h 127.0.0.1 -p ${dbPort}`,'-w','start'], {windowsHide:true,stdio:'ignore'});
    nativeStarted=true;
    const client = new pg.Client({host:'127.0.0.1',port:dbPort,user:'postgres',database:'postgres'}); await client.connect();
    db = {exec:sql=>client.query(sql),query:(sql,params)=>client.query(sql,params),close:()=>client.end()};
  } else {
    const { PGlite } = await import(pathToFileURL(path.join(moduleRoot, '@electric-sql/pglite/dist/index.js')));
    const { PGLiteSocketServer } = await import(pathToFileURL(path.join(moduleRoot, '@electric-sql/pglite-socket/dist/index.js')));
    db = await PGlite.create();
    socket = new PGLiteSocketServer({ db, host: '127.0.0.1', port: dbPort }); await socket.start();
  }
  await db.exec(await readFile('gestaocabana/database/schema.sql', 'utf8'));
  const hash = execFileSync(php, ['-r', 'echo password_hash("ValidationOnly123!", PASSWORD_DEFAULT);'], { encoding: 'utf8' }).trim();
  const id = '11111111-1111-4111-8111-111111111111';
  await db.query('INSERT INTO crm_users(id,email,password_hash) VALUES($1,$2,$3)', [id, 'admin@test.invalid', hash]);
  await db.query("INSERT INTO crm_profiles(id,email,role) VALUES($1,$2,'admin')", [id, 'admin@test.invalid']);
  const configFile = path.join(temporary, 'config.php');
  const config = `<?php return ['enabled'=>true,'dsn'=>'pgsql:host=127.0.0.1;port=${dbPort};dbname=postgres;sslmode=disable','user'=>'postgres','password'=>'test-only','rate_limit_dir'=>'${temporary.replaceAll('\\','/')}/limits'];`;
  await writeFile(configFile, config);
  let logs = '';
  server = spawn(php, [...phpArgs, '-S', `127.0.0.1:${httpPort}`, '-t', root], { env: { ...process.env, CABANA_CONFIG_FILE: configFile }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stderr.on('data', chunk => { logs += chunk; });
  const base = `http://127.0.0.1:${httpPort}/gestaocabana/api/index.php`;
  let ready = false;
  for (let i=0; i<80; i++) { try { const response = await fetch(base+'/health'); if (response.status===200) { ready=true; break; } } catch {} await new Promise(resolve=>setTimeout(resolve,100)); }
  check(ready, 'PHP/PDO não iniciou: '+logs);
  async function request(url, method='GET', body, session=null, expected=200, prefer='return=representation') {
    const headers = { 'Content-Type':'application/json', Prefer:prefer };
    if(session) { headers.Cookie=session.cookie; headers.Authorization='Bearer '+session.access_token; }
    const response = await fetch(base+url, {method, headers, body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text(); let payload; try { payload=text?JSON.parse(text):null; } catch { throw new Error('Resposta não JSON: '+text+' '+logs); }
    assert.equal(response.status,expected, url+' '+JSON.stringify(payload)+' '+logs);
    passed++;
    return {payload,response};
  }
  async function login(email,password='ValidationOnly123!') {
    const {payload,response}=await request('/auth/v1/token?grant_type=password','POST',{email,password});
    return {...payload,cookie:response.headers.get('set-cookie').split(';')[0]};
  }
  await request('/rest/v1/crm_clients', 'GET', undefined, null, 401);
  await request('/auth/v1/token?grant_type=password','POST',{email:'admin@test.invalid',password:'wrong'},null,401);
  const admin=await login('admin@test.invalid');
  const {payload:profiles}=await request('/rest/v1/crm_profiles?select=id,email,role,blocked', 'GET', undefined, admin);
  check(profiles[0].role==='admin' && profiles[0].blocked===false,'Perfil e bools.');
  await request('/rest/v1/crm_users','GET',undefined,admin,404);
  await request('/rest/v1/crm_braga_financial_accounts','GET',undefined,admin,403);
  await request('/rest/v1/rpc/crm_admin_create_user','POST',{user_email:'user@test.invalid',user_password:'ValidationOnly123!',user_role:'user'},admin);
  const user=await login('user@test.invalid');
  await request('/rest/v1/crm_financial_accounts','GET',undefined,user,403);
  await request('/rest/v1/rpc/crm_admin_set_password','POST',{},user,403);
  await request('/rest/v1/crm_profiles?id=eq.'+user.user.id,'PATCH',{role:'admin'},user,403);
  const clientId='client-validation';
  const {payload:inserted}=await request('/rest/v1/crm_clients?on_conflict=id','POST',{id:clientId,user_id:id,data:{settings:{},rows:[],budgets:[{id:'budget-test'}]}},user,201);
  check(inserted[0].user_id===user.user.id,'Proteção contra troca de proprietário.');
  check(!Array.isArray(inserted[0].data.settings),'Objeto vazio preservado.');
  const oldVersion=inserted[0].updated_at;
  const {payload:updated}=await request('/rest/v1/crm_clients?id=eq.'+clientId+'&updated_at=eq.'+encodeURIComponent(oldVersion),'PATCH',{data:{saved:true}},user);
  check(updated.length===1,'Edição com versão correta.');
  const {payload:stale}=await request('/rest/v1/crm_clients?id=eq.'+clientId+'&updated_at=eq.'+encodeURIComponent(oldVersion),'PATCH',{data:{saved:false}},user);
  check(stale.length===0,'Conflito de edição deve preservar o banco.');
  await request('/rest/v1/crm_clients?on_conflict=id','POST',{id:'admin-client',user_id:id,data:{private:true}},admin,201);
  const {payload:own}=await request('/rest/v1/crm_clients?select=*&order=id.asc&limit=1','GET',undefined,user);
  check(own.length===1&&own[0].id===clientId,'Isolamento por usuário.');
  await request('/rest/v1/crm_clients?on_conflict=id','POST',{id:'admin-client',data:{}},user,403);
  const {payload:accounts}=await request('/rest/v1/crm_financial_accounts','POST',[{name:'Origem',account_type:'bank'},{name:'Destino',account_type:'bank'}],admin,201);
  const group='22222222-2222-4222-8222-222222222222';
  const entries=[1,2,3].map(n=>({entry_type:'transfer',status:n===1?'paid':'pending',paid_at:n===1?'2026-10-15T12:00:00Z':null,account_id:accounts[0].id,transfer_account_id:accounts[1].id,description:'Transferência de validação',amount:50,issue_date:`2026-${9+n}-15`,competence_date:`2026-${9+n}-15`,due_date:`2026-${9+n}-15`,installment_number:n,installment_count:3,installment_group_id:group}));
  await request('/rest/v1/crm_financial_entries','POST',entries,admin,201);
  const {payload:patched}=await request('/rest/v1/crm_financial_entries?installment_group_id=eq.'+group+'&status=in.(pending,overdue)','PATCH',{amount:75},admin);
  check(patched.length===2,'Alterar somente parcelas pendentes.');
  await request('/rest/v1/crm_financial_entries','POST',[{...entries[0],amount:10},{...entries[1],amount:-1}],admin,409);
  const {payload:all,response:countResponse}=await request('/rest/v1/crm_financial_entries?order=id.asc','GET',undefined,admin,200,'count=exact');
  check(all.length===3&&countResponse.headers.get('content-range').endsWith('/3'),'Lotes atômicos e contagem.');
  await request('/rest/v1/crm_clients?badcolumn=eq.test','GET',undefined,user,400);
  const {payload:refresh}=await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:admin.refresh_token},admin);
  check(refresh.user.id===id,'Renovação de sessão.');
  await request('/auth/v1/logout','POST',{},user);
  await request('/rest/v1/crm_clients','GET',undefined,user,401);
  console.log(`Integração PHP + PostgreSQL descartável: ${passed} verificações passaram.`);
} finally {
  if(server) { server.kill(); await new Promise(resolve=>server.once('exit',resolve)); }
  if(socket) await socket.stop();
  if(db) await db.close();
  if(nativeStarted) execFileSync(path.join(pgBin,'pg_ctl.exe'),['-D',path.join(temporary,'data'),'-m','fast','-w','stop'],{windowsHide:true,stdio:'pipe'});
  await rm(temporary,{recursive:true,force:true});
}
