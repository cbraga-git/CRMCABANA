import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const [app, schema, financialSchema] = await Promise.all([
  readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8"),
  readFile(new URL("../supabase-schema.sql", import.meta.url), "utf8"),
  readFile(new URL("../supabase-financeiro.sql", import.meta.url), "utf8"),
]);
const backupCode = app.slice(app.indexOf("function backupFileName()"), app.indexOf("function parseCsv("));

function backupContext(overrides = {}) {
  const context = {
    CONFIG: { supabaseUrl: "https://test.supabase.co", supabaseAnonKey: "test" },
    state: { session: { user: { id: "admin-id", email: "admin@test.com" } }, userRole: "admin", clients: [], environments: [] },
    elements: { backupStatus: null },
    URLSearchParams,
    TextEncoder,
    Blob,
    atob,
    remoteDatabaseEnabled: () => true,
    currentUserId: () => "admin-id",
    authorizedFetch: async () => { throw new Error("Unexpected request"); },
    supabaseTableEndpoint: (table, query) => `https://test.supabase.co/rest/v1/${table}${query}`,
    supabaseHeaders: (prefer) => ({ Prefer: prefer }),
    sha256: async () => "sha256-test",
    ...overrides,
  };
  vm.runInNewContext(`${backupCode}\nglobalThis.backupApi = { BACKUP_TABLES, backupFileName, backupTableWorkbook, backupZipCrc32, createBackupArchive, collectSiteBackupFiles, fetchSupabaseTableBackup, collectDatabaseBackup, saveBackupFile, createFullBackup };`, context);
  return context.backupApi;
}

function response(rows, count, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    headers: { get: (name) => name === "content-range" ? `0-${Math.max(0, rows.length - 1)}/${count}` : null },
    json: async () => rows,
  };
}

function readStoredZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const files = new Map();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
    const start = offset + 30 + nameLength;
    files.set(name, bytes.subarray(start, start + size));
    offset = start + size;
  }
  assert.equal(view.getUint32(offset, true), 0x02014b50);
  const endOffset = bytes.length - 22;
  assert.equal(view.getUint32(endOffset, true), 0x06054b50);
  assert.equal(view.getUint16(endOffset + 10, true), files.size);
  assert.equal(view.getUint32(endOffset + 16, true), offset);
  return files;
}

test("backup inclui todas as tabelas publicas do CRM", () => {
  const { BACKUP_TABLES } = backupContext();
  const declaredTables = [...`${schema}\n${financialSchema}`.matchAll(/create table if not exists public\.(crm_\w+)/g)].map((match) => match[1]);
  assert.equal(declaredTables.length, 12);
  assert.deepEqual(Array.from(BACKUP_TABLES, ({ name }) => name).sort(), declaredTables.sort());
});

test("backup pagina por chave e confirma a contagem antes de aceitar uma tabela", async () => {
  const ids = Array.from({ length: 1001 }, (_, index) => ({ id: String(index + 1).padStart(4, "0") }));
  const requests = [];
  const { fetchSupabaseTableBackup } = backupContext({
    authorizedFetch: async (url, options) => {
      const query = new URL(url).searchParams;
      requests.push({ cursor: query.get("id"), prefer: options().headers.Prefer });
      if (query.get("select") === "id") return response(ids.slice(0, 1), 1001);
      return response(query.get("id") ? ids.slice(1000) : ids.slice(0, 1000), 1001);
    },
  });
  const result = await fetchSupabaseTableBackup({ name: "crm_clients", key: "id" });
  assert.equal(result.count, 1001);
  assert.equal(result.rows.length, 1001);
  assert.equal(requests[0].prefer, "count=exact");
  assert.equal(requests[1].cursor, "gt.1000");
  assert.equal(requests[2].prefer, "count=exact");
});

test("backup rejeita tabela alterada ou arquivo publicado ausente", async () => {
  const { fetchSupabaseTableBackup } = backupContext({
    authorizedFetch: async (url) => response([{ id: "1" }], new URL(url).searchParams.get("select") === "id" ? 2 : 1),
  });
  await assert.rejects(fetchSupabaseTableBackup({ name: "crm_clients", key: "id" }), /mudou durante o backup/);

  const { collectSiteBackupFiles } = backupContext({ fetch: async () => ({ ok: false, status: 404 }) });
  await assert.rejects(collectSiteBackupFiles(), /Nao foi possivel copiar/);
});

test("seletor de arquivo abre no clique antes da primeira leitura assincrona", async () => {
  let pickerOpened = false;
  let fetchAfterPicker = false;
  const button = { disabled: false };
  const { createFullBackup } = backupContext({
    elements: { backupStatus: null, backupSiteDataBtn: button },
    isAdmin: () => true,
    window: { location: { href: "https://test.example/crmcabana/" }, showSaveFilePicker: () => { pickerOpened = true; return Promise.resolve({}); } },
    fetch: async () => { fetchAfterPicker = pickerOpened; return { ok: false, status: 404 }; },
    alert: () => {},
    console: { warn: () => {} },
  });
  await createFullBackup();
  assert.equal(pickerOpened, true);
  assert.equal(fetchAfterPicker, true);
  assert.equal(button.disabled, false);
});

test("arquivo escolhido recebe o ZIP depois da coleta", async () => {
  let saved = "";
  const handle = { createWritable: async () => ({
    write: async (blob) => { saved = blob.type; },
    close: async () => {},
  }) };
  const { saveBackupFile } = backupContext({ Blob });
  await saveBackupFile("backup.zip", new Blob(["zip"], { type: "application/zip" }), handle);
  assert.equal(saved, "application/zip");
});

test("ZIP contem site, JSON completo e um XLSX por tabela", async () => {
  const { backupFileName, backupZipCrc32, createBackupArchive } = backupContext();
  assert.match(backupFileName(), /\.zip$/);
  assert.equal(backupZipCrc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const backup = {
    site: { files: [
      { path: "../index.html", type: "text", content: "<html>teste</html>" },
      { path: "assets/logo.png", type: "dataUrl", content: "data:image/png;base64,AQID" },
    ] },
    database: { tables: [
      { table: "crm_clients", count: 1, rows: [{ id: "1", data: { nome: "Ana\nMaria" } }] },
      { table: "crm_financial_budgets", count: 0, rows: [] },
    ] },
  };
  const archive = await createBackupArchive(backup);
  assert.equal(archive.type, "application/zip");
  const files = readStoredZip(new Uint8Array(await archive.arrayBuffer()));
  assert.ok(files.has("backup-completo.json"));
  assert.ok(files.has("site/index.html"));
  assert.deepEqual(Array.from(files.get("site/crmcabana/assets/logo.png")), [1, 2, 3]);
  assert.equal([...files.keys()].filter((name) => name.endsWith(".xlsx")).length, 2);
  const workbook = readStoredZip(files.get("tabelas/crm_clients.xlsx"));
  assert.ok(workbook.has("[Content_Types].xml"));
  assert.ok(workbook.has("xl/workbook.xml"));
  const sheet = new TextDecoder().decode(workbook.get("xl/worksheets/sheet1.xml"));
  assert.match(sheet, /<c r="A1"[^>]*><is><t[^>]*>id<\/t>/);
  assert.match(sheet, /<c r="B1"[^>]*><is><t[^>]*>data<\/t>/);
  assert.match(sheet, /Ana\\nMaria/);
  assert.ok(readStoredZip(files.get("tabelas/crm_financial_budgets.xlsx")).has("xl/worksheets/sheet1.xml"));
  assert.ok(files.has("LEIA-ME.txt"));
});

test("planilha trata caracteres XML e celulas longas sem formulas", async () => {
  const { backupTableWorkbook } = backupContext();
  const workbook = backupTableWorkbook({ table: "crm_clients", rows: [{ id: "=SUM(A1:A2)", data: "A&B <C> \"D\"", notes: "x".repeat(33000) }] });
  const files = readStoredZip(new Uint8Array(await workbook.arrayBuffer()));
  const sheet = new TextDecoder().decode(files.get("xl/worksheets/sheet1.xml"));
  assert.match(sheet, /A&amp;B &lt;C&gt; &quot;D&quot;/);
  assert.match(sheet, /=SUM\(A1:A2\)/);
  assert.doesNotMatch(sheet, /<f>/);
  assert.match(sheet, /TRUNCADO; VER BACKUP-COMPLETO.JSON/);
});

test("relatorio XLSX preserva valores monetarios como numeros", async () => {
  const { backupTableWorkbook } = backupContext();
  const workbook = backupTableWorkbook({ table: "transactions", columns: ["Descrição", "Valor (R$)"], numericColumns: ["Valor (R$)"], rows: [{ "Descrição": "Receita", "Valor (R$)": 123.45 }] });
  const files = readStoredZip(new Uint8Array(await workbook.arrayBuffer()));
  const sheet = new TextDecoder().decode(files.get("xl/worksheets/sheet1.xml"));
  assert.match(sheet, /<c r="B2" s="2"><v>123\.45<\/v><\/c>/);
});
