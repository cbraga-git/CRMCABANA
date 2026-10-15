import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));
const scopeSource = extract("function canAccessBragaFinance()", "\nfunction startsInFinanceTransactions()");
const endpointSource = extract("function supabaseTableEndpoint(", "\nfunction supabaseRpcEndpoint(");

function harness(overrides = {}) {
  const state = { userRole: "admin", financialScope: "company", financialScopeVersion: 0,
    session: { user: { id: "owner", email: "fernandes.braga@gmail.com" } }, ...overrides };
  const nodes = new Map();
  const document = { querySelector: (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, { value: "", reset() {}, disabled: false });
    return nodes.get(selector);
  }, querySelectorAll: () => [] };
  const context = { state, document, elements: {}, financialTableSorts: new WeakMap(),
    CONFIG: { supabaseUrl: "https://test.supabase.co" },
    currentUserId: () => state.session?.user?.id || "", isAdmin: () => state.userRole === "admin" };
  const api = runInNewContext(`${app.match(/^const BRAGA_FINANCE_EMAIL = .*;$/m)[0]}\n${scopeSource}\n${endpointSource}\n({ canAccessBragaFinance, canAccessFinancialScope, resetFinancialScopeData, financialScopeBusy, supabaseTableEndpoint })`, context);
  return { state, context, document, api };
}

test("personal finance belongs to the authenticated email, independent of admin role", () => {
  const h = harness({ userRole: "user" });
  assert.equal(h.api.canAccessFinancialScope("braga"), true);
  assert.equal(h.api.canAccessFinancialScope("company"), false);
  h.state.userRole = "admin";
  h.state.session.user.email = "other@example.com";
  assert.equal(h.api.canAccessFinancialScope("braga"), false);
  assert.equal(h.api.canAccessFinancialScope("company"), true);
  h.state.session = null;
  assert.equal(h.api.canAccessBragaFinance(), false);
});

test("personal CRUD endpoints use separate tables and company operations remain explicit", () => {
  const h = harness({ financialScope: "braga" });
  for (const table of ["accounts", "categories", "cost_centers", "entries", "statement_imports", "statement_items", "reconciliations", "budgets"]) {
    assert.equal(h.api.supabaseTableEndpoint(`crm_financial_${table}`, "?id=eq.1"), `https://test.supabase.co/rest/v1/crm_braga_financial_${table}?id=eq.1`);
    assert.equal(h.api.supabaseTableEndpoint(`crm_financial_${table}`, "", "company"), `https://test.supabase.co/rest/v1/crm_financial_${table}`);
  }
  assert.equal(h.api.supabaseTableEndpoint("crm_clients"), "https://test.supabase.co/rest/v1/crm_clients");
  h.state.session.user.email = "other@example.com";
  assert.throws(() => h.api.supabaseTableEndpoint("crm_financial_entries"), /exclusivo/);
  assert.throws(() => h.api.supabaseTableEndpoint("crm_braga_financial_entries", "", "company"), /exclusivo/);
});

test("scope reset discards previous account IDs, selections, tags, imports and filters", () => {
  const h = harness({ financialAccounts: [{ id: "company" }], financialEntries: [{ id: "company-entry" }],
    financialSelectedEntryIds: new Set(["company-entry"]), financialEditingEntryId: "company-entry",
    financialTagEntries: [{ id: "company-entry" }], financialSelectedImportId: "company-import",
    financialEntryFilters: { accountId: "company" }, financialScopeError: "old error" });
  h.api.resetFinancialScopeData();
  assert.equal(h.state.financialAccounts.length, 0);
  assert.equal(h.state.financialEntries.length, 0);
  assert.equal(h.state.financialSelectedEntryIds.size, 0);
  assert.equal(h.state.financialEditingEntryId, null);
  assert.equal(h.state.financialTagEntries, null);
  assert.equal(h.state.financialSelectedImportId, null);
  assert.equal(h.state.financialEntryFilters.accountId, "__bank_accounts__");
  assert.equal(h.state.financialScopeError, "");
});

test("scope switching waits for async operations, exports and open financial forms", () => {
  const h = harness();
  assert.equal(h.api.financialScopeBusy(), false);
  h.state.financialOperations = 1;
  assert.equal(h.api.financialScopeBusy(), true);
  h.state.financialOperations = 0;
  h.document.querySelector("#reportsExportBtn").disabled = true;
  assert.equal(h.api.financialScopeBusy(), true);
  h.document.querySelector("#reportsExportBtn").disabled = false;
  h.context.elements.financialEntryDialog = { open: true };
  assert.equal(h.api.financialScopeBusy(), true);
});

test("late financial loads cannot replace the newly selected scope", async () => {
  const h = harness();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const load = runInNewContext(`${extract("async function loadFinancialRegisters(", "\nfunction renderFinancialAccounts()")}\nloadFinancialRegisters`, {
    ...h.context, remoteDatabaseEnabled: () => true,
    canAccessFinancialScope: h.api.canAccessFinancialScope,
    supabaseTableEndpoint: h.api.supabaseTableEndpoint, supabaseHeaders: () => ({}),
    authorizedFetch: async () => { await pending; return { ok: true, json: async () => [{ id: "old-company" }] }; },
  });
  const loading = load();
  h.state.financialScope = "braga";
  h.state.financialScopeVersion++;
  h.api.resetFinancialScopeData();
  release();
  await loading;
  assert.equal(h.state.financialAccounts.length, 0);
  assert.equal(h.state.financialEntries.length, 0);
});

test("failed personal load reports its migration and never requests corporate fallback", async () => {
  const h = harness({ financialScope: "braga", userRole: "user" });
  const urls = [];
  const load = runInNewContext(`${extract("async function loadFinancialRegisters(", "\nfunction renderFinancialAccounts()")}\nloadFinancialRegisters`, {
    ...h.context, remoteDatabaseEnabled: () => true,
    canAccessFinancialScope: h.api.canAccessFinancialScope,
    supabaseTableEndpoint: h.api.supabaseTableEndpoint, supabaseHeaders: () => ({}),
    authorizedFetch: async (url) => { urls.push(url); return { ok: false }; },
  });
  await assert.rejects(load(), /supabase-financeiro-braga.sql/);
  assert.equal(urls.length, 4);
  assert.ok(urls.every((url) => url.includes("/crm_braga_financial_")));
});

test("personal reports query only personal tables, without requesting CRM clients", async () => {
  const h = harness({ financialScope: "braga", userRole: "user" });
  const tables = [];
  const filters = { kind: "clients", clientId: "company-client" };
  let exported;
  const exportReport = runInNewContext(`${extract("async function exportReport(", "\nasync function createBackupArchive(")}\nexportReport`, {
    ...h.context, canAccessFinancialScope: h.api.canAccessFinancialScope, reportFilters: () => filters,
    window: {}, alert: (message) => { throw new Error(message); },
    fetchSupabaseTableBackup: async ({ name }) => { tables.push(name); return { rows: [] }; },
    reportClientsFromDatabase: () => { throw new Error("Corporate clients must not be read"); },
    reportTransactionRows: (entries, accounts, categories, clients) => { assert.equal(clients.length, 0); return []; },
    REPORT_COLUMNS: { transactions: [] }, REPORT_NUMERIC_COLUMNS: { transactions: [] },
    backupTableWorkbook: (options) => options,
    saveBackupFile: async (name, workbook) => { exported = { name, workbook }; },
  });
  await exportReport({ preventDefault() {} });
  assert.deepEqual(tables, ["crm_braga_financial_entries", "crm_braga_financial_accounts", "crm_braga_financial_categories"]);
  assert.equal(filters.kind, "transactions");
  assert.equal(filters.clientId, "");
  assert.match(exported.name, /^crm-braga-transactions-/);
  assert.equal(h.document.querySelector("#reportsExportBtn").disabled, false);
});

test("personal menu preserves the active financial features and has unique IDs", () => {
  const menu = html.slice(html.indexOf('id="bragaFinancialNavGroup"'), html.indexOf('id="reportsNavItem"'));
  for (const view of ["financeOverview", "financeAccounts", "financeTransactions", "financeImport", "financeCategories", "reports"]) {
    assert.match(menu, new RegExp(`data-view="${view}" data-financial-scope="braga"`));
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("personal bulk deletion never reconciles company budgets", async () => {
  const h = harness({ financialScope: "braga", view: "financeTransactions", financialSelectedEntryIds: new Set(["personal"]),
    financialEntries: [{ id: "personal" }], clients: [{ id: "company-client" }] });
  const remove = runInNewContext(`${extract("async function deleteSelectedFinancialEntries()", "\nfunction financialEntryViewType(")}\ndeleteSelectedFinancialEntries`, {
    ...h.context, confirm: () => true, updateFinancialEntrySelection() {}, renderFinancialEntries() {},
    supabaseTableEndpoint: h.api.supabaseTableEndpoint, supabaseHeaders: () => ({}),
    authorizedFetch: async (url) => { assert.match(url, /crm_braga_financial_entries/); return { ok: true }; },
    clientBudgetHistory: () => { throw new Error("Corporate budgets must not be accessed"); },
    loadFinancialRegisters: async () => {},
  });
  await remove();
  assert.equal(h.state.financialOperations, 0);
  assert.equal(h.state.financialEntries.length, 0);
});
