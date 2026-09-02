import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [app, html, schema, workflow] = await Promise.all([
  readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8"),
  readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8"),
  readFile(new URL("../supabase-schema.sql", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
]);

test("cadastro publico nao e oferecido nem chamado pelo cliente", () => {
  assert.doesNotMatch(html, /Criar nova conta|id="authToggle"/i);
  assert.doesNotMatch(app, /\/signup|function signUp\s*\(/);
});

test("sessao autenticada nao e persistida no localStorage", () => {
  assert.match(app, /sessionStorage\.setItem\(SESSION_KEY/);
  assert.doesNotMatch(app, /localStorage\.setItem\(SESSION_KEY/);
});

test("inicializacao para quando o perfil nao autoriza acesso", () => {
  assert.match(app, /const accessAllowed = await ensureUserProfile\(\)/);
  assert.match(app, /if \(!accessAllowed\)[\s\S]*?showAuthScreen\(\)[\s\S]*?return false/);
});

test("administrador precisa estar desbloqueado", () => {
  assert.match(schema, /role = 'admin'\s+and blocked = false/);
});

test("helpers privilegiados nao sao executaveis por clientes", () => {
  assert.match(schema, /revoke execute on function public\.crm_hash_password\(text\) from public, anon, authenticated/);
  assert.match(schema, /revoke execute on function public\.crm_log_action\(text, uuid, text, jsonb\) from public, anon, authenticated/);
  assert.match(schema, /grant execute on function public\.crm_admin_create_user\(text, text, text\) to authenticated/);
});

test("pagina define politica de seguranca de conteudo", () => {
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /frame-ancestors 'none'/);
});

test("orcamento e pedido incluem campos Nobilia e ocultam vendedor no cabecalho", () => {
  assert.match(html, /id="budgetNobiliaId"/);
  assert.match(html, /id="budgetNobiliaDate"/);
  assert.match(html, /<label\s+hidden>\s*Vendedor\s*<input[^>]*id="budgetSeller"[^>]*>/i);
  assert.match(app, /nobiliaId|nobiliaDate/);
});

test("listagem de orcamentos exibe o campo ID Nobilia apos o ID do orçamento", () => {
  assert.match(html, /ID Nobilia|ID NOBILIA/);
  assert.match(app, /budget\.nobiliaId|nobiliaId.*budget\.code|budget\.code.*nobiliaId/);
});

test("filtros de status de orcamento exibem contagem discreta por categoria", () => {
  assert.match(app, /pill-count|statusCounts|renderStatusFilters/);
  assert.match(app, /count.*status|status.*count/i);
});

test("preferencias visuais do CRM persistem no navegador entre sessoes", () => {
  assert.match(app, /APP_PREFERENCES_KEY|appPreferences|localStorage\.setItem\(APP_PREFERENCES_KEY/);
  assert.match(app, /budgetCodeSeparator|statusCountsVisible|showNobilia/);
});

test("status padrao de orcamento usa Novo e aparece imediatamente apos Todos", () => {
  assert.match(app, /name:\s*"Novo"|"Novo"/);
  assert.doesNotMatch(app, /Novo\s+Orçamento/);
  assert.match(app, /\[\s*"Todos"\s*,\s*\.\.\.documentStatuses\s*\]|\[\s*"Todos"\s*,\s*\.\.\./);
});

test("status legado de orcamento e pedido sao migrados para os nomes atuais", () => {
  assert.match(app, /function\s+normalizeBudgetStatusValue\s*\(/);
  assert.doesNotMatch(app, /Novo\s+Orçamento/);
});

test("actions do deploy usam commits imutaveis", () => {
  const actionRefs = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/g)].map((match) => match[1]);
  assert.ok(actionRefs.length >= 3);
  actionRefs.forEach((ref) => assert.match(ref, /^[a-f0-9]{40}$/));
});
