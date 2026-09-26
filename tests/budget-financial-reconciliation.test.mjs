import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));

function harness({ entries = [], simulated = false, fetchError = false, saveOk = true } = {}) {
  const budget = { id: "budget-1", financialLaunchedAt: simulated ? "" : "2026-09-26", financialSimulationAt: simulated ? "2026-09-26" : "", rows: [{ gross: 100 }] };
  const other = { id: "budget-2", financialLaunchedAt: "2026-09-25" };
  const state = { clients: [{ id: "client-1", name: "Cliente", budget: { ...budget }, budgets: [{ ...budget }, other] }] };
  const saved = [];
  const queried = [];
  const context = {
    state,
    remoteDatabaseEnabled: () => true,
    currentUserId: () => "user",
    budgetIdentity: (item) => item?.id,
    budgetFinancialEntryIds: async () => [["income-1", "income-id"], ["tax", "tax-id"]],
    fetchBudgetFinancialEntries: async (ids) => {
      queried.push([...ids]);
      if (fetchError) throw new Error("Falha de conexão");
      return entries;
    },
    saveClients: async (ids = []) => { saved.push([...ids]); return saveOk; },
  };
  const reconcile = runInNewContext(`${extract("async function reconcileBudgetFinancialStatus(", "\nasync function syncBudgetFinancialEntries(")}\nreconcileBudgetFinancialStatus`, context);
  return { budget, other, state, saved, queried, context, reconcile };
}

for (const simulated of [false, true]) {
  test(`última transação excluída limpa marca ${simulated ? "simulada" : "efetiva"} nas duas cópias do orçamento`, async () => {
    const h = harness({ simulated });
    assert.equal(await h.reconcile("client-1", h.budget), true);
    const client = h.state.clients[0];
    for (const budget of [client.budget, client.budgets[0]]) {
      assert.equal(budget.financialLaunchedAt, "");
      assert.equal(budget.financialSimulationAt, "");
      assert.equal(budget.rows[0].gross, 100);
    }
    assert.equal(client.budgets[1], h.other);
    assert.deepEqual(h.saved, [["client-1"]]);
    assert.deepEqual(h.queried, [["income-id", "tax-id"]]);
  });
}

test("exclusão parcial mantém marca enquanto houver transação vinculada", async () => {
  const h = harness({ entries: [{ id: "tax-id", status: "paid" }] });
  assert.equal(await h.reconcile("client-1", h.budget), false);
  assert.equal(h.state.clients[0].budget.financialLaunchedAt, "2026-09-26");
  assert.equal(h.saved.length, 0);
});

test("erro de consulta não é interpretado como ausência de transações", async () => {
  const h = harness({ fetchError: true });
  await assert.rejects(h.reconcile("client-1", h.budget), /Falha de conexão/);
  assert.equal(h.state.clients[0].budget.financialLaunchedAt, "2026-09-26");
  assert.equal(h.saved.length, 0);
});

test("erro ao persistir preserva marca local para permitir nova conferência", async () => {
  const h = harness({ saveOk: false });
  await assert.rejects(h.reconcile("client-1", h.budget), /não foi possível confirmar/);
  assert.equal(h.state.clients[0].budget.financialLaunchedAt, "2026-09-26");
});

test("exclusão em transações confere orçamento correspondente após excluir no banco", async () => {
  const h = harness();
  let deleted = false;
  Object.assign(h.context, {
    confirm: () => true,
    supabaseTableEndpoint: (table, query) => table + query,
    supabaseHeaders: () => ({}),
    authorizedFetch: async () => { deleted = true; return { ok: true }; },
    clientBudgetHistory: () => [h.budget],
    reconcileBudgetFinancialStatus: async (...args) => { assert.equal(deleted, true); return h.reconcile(...args); },
    loadFinancialRegisters: async () => {},
  });
  const remove = runInNewContext(`${extract("async function deleteFinancialRecord(", "\nfunction financialEntryViewType(")}\ndeleteFinancialRecord`, h.context);
  assert.equal(await remove("crm_financial_entries", "tax-id", "este lançamento"), true);
  assert.equal(h.state.clients[0].budget.financialLaunchedAt, "");
});

test("exclusão de transação sem vínculo não altera orçamento", async () => {
  const h = harness();
  Object.assign(h.context, {
    confirm: () => true,
    supabaseTableEndpoint: () => "entries",
    supabaseHeaders: () => ({}),
    authorizedFetch: async () => ({ ok: true }),
    clientBudgetHistory: () => [h.budget],
    reconcileBudgetFinancialStatus: h.reconcile,
    loadFinancialRegisters: async () => {},
  });
  const remove = runInNewContext(`${extract("async function deleteFinancialRecord(", "\nfunction financialEntryViewType(")}\ndeleteFinancialRecord`, h.context);
  await remove("crm_financial_entries", "unrelated-id", "este lançamento");
  assert.equal(h.saved.length, 0);
  assert.equal(h.queried.length, 0);
});
