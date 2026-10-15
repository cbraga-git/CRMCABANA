import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("async function deleteSelectedFinancialEntries() {");
const end = app.indexOf("\nfunction financialEntryViewType", start);
function setup({ confirmed = true, ok = true } = {}) {
  const state = { view: "financeTransactions", financialSelectedEntryIds: new Set(["a", "b"]), financialDeletingEntries: false,
    financialEntries: [{ id: "a" }, { id: "b" }, { id: "c" }], clients: [{ id: "client" }] };
  const calls = [];
  const remove = runInNewContext(`${app.slice(start, end)}\ndeleteSelectedFinancialEntries`, {
    state, confirm: () => confirmed, updateFinancialEntrySelection() {}, renderFinancialEntries() {},
    encodeURIComponent, supabaseHeaders: () => ({}), supabaseTableEndpoint: (table, query) => table + query,
    authorizedFetch: async (url, options) => { calls.push([url, options().method]); return { ok, json: async () => ({ message: "Falha" }) }; },
    clientBudgetHistory: () => [{ financialLaunchedAt: "date" }], budgetFinancialEntryIds: async () => [["income-1", "a"]],
    reconcileBudgetFinancialStatus: async (id) => calls.push(["reconcile", id]), loadFinancialRegisters: async () => calls.push(["reload"]),
  });
  return { state, calls, remove };
}
test("exclusão em lote remove somente os selecionados e reconcilia o orçamento", async () => {
  const { state, calls, remove } = setup();
  await remove();
  assert.deepEqual(calls, [["crm_financial_entries?id=in.(a,b)", "DELETE"], ["reconcile", "client"], ["reload"]]);
  assert.deepEqual(state.financialEntries.map((entry) => entry.id), ["c"]);
  assert.equal(state.financialSelectedEntryIds.size, 0);
  assert.equal(state.financialDeletingEntries, false);
});
test("cancelar não envia exclusão nem perde a seleção", async () => {
  const { state, calls, remove } = setup({ confirmed: false });
  await remove();
  assert.equal(calls.length, 0);
  assert.equal(state.financialSelectedEntryIds.size, 2);
});
test("falha no servidor preserva os registros e permite tentar novamente", async () => {
  const { state, remove } = setup({ ok: false });
  await assert.rejects(remove(), /Falha/);
  assert.equal(state.financialEntries.length, 3);
  assert.equal(state.financialSelectedEntryIds.size, 2);
  assert.equal(state.financialDeletingEntries, false);
});
test("exclusão em andamento bloqueia nova solicitação", async () => {
  const { state, calls, remove } = setup();
  state.financialDeletingEntries = true;
  await remove();
  assert.equal(calls.length, 0);
});
