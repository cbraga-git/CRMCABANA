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
    remoteDatabaseEnabled: () => true,
    currentUserId: () => "admin-id",
    authorizedFetch: async () => { throw new Error("Unexpected request"); },
    supabaseTableEndpoint: (table, query) => `https://test.supabase.co/rest/v1/${table}${query}`,
    supabaseHeaders: (prefer) => ({ Prefer: prefer }),
    sha256: async () => "sha256-test",
    ...overrides,
  };
  vm.runInNewContext(`${backupCode}\nglobalThis.backupApi = { BACKUP_TABLES, collectSiteBackupFiles, fetchSupabaseTableBackup, collectDatabaseBackup };`, context);
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
