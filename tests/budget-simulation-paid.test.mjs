import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));
function harness(accept = true, mode = "simulation") {
  const rows = new Map([
    ["cost", { id: "cost", status: "paid", paid_at: "2026-10-01", amount: 100, description: "Simulado - Fábrica", notes: "" }],
    ["old", { id: "old", status: "paid", amount: 80, description: "Simulado - Parcela", notes: "" }],
  ]);
  const writes = [], prompts = [];
  const ctx = { state: { financialAccounts: [{ id: "account", active: true, account_type: "bank", name: "Mercado Pago" }], financialCategories: [] },
    remoteDatabaseEnabled: () => true, currentUserId: () => "owner", budgetFinancialStatusAllowed: () => true,
    budgetFinancialEntryIds: async () => [["factoryFreight", "cost"], ["income-1", "old"], ["plan-income-1", "new"]],
    fetchBudgetFinancialEntries: async (ids) => [...rows.values()].filter(row => ids.includes(row.id)),
    loadFinancialRegisters: async () => {}, normalizedMigrationText: s => s.toLowerCase(), budgetFinancialLocalDate: () => "2026-10-06",
    budgetFinancialPlan: () => [{ key: "factoryFreight", amount: 150, category_id: "factory", description: "Simulado - Fábrica", notes: "" }, { key: "plan-income-1", amount: 200, category_id: "income", description: "Simulado - Parcela", notes: "", due_date: "2026-11-01" }],
    BUDGET_FINANCIAL_EXPENSES: [], budgetFinancialCents: v => Math.round(Number(v || 0) * 100),
    BRL: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    financialEntryNotes: entry => entry.notes || "", financialEntryTags: () => [], notesWithFinancialTags: s => s,
    confirm: message => { prompts.push(message); return accept; },
    saveFinancialRecord: async (_table, id, payload) => { writes.push({ id, payload }); rows.set(id, { ...rows.get(id), ...payload }); },
    postFinancialRows: async (_table, added) => { for (const row of added) { writes.push(row); rows.set(row.id, row); } },
    supabaseTableEndpoint: (_table, query) => query, supabaseHeaders: () => ({}),
    authorizedFetch: async (query) => { const id = query.split("eq.")[1]; writes.push({ deleted: id }); rows.delete(id); return { ok: true }; },
  };
  const api = runInNewContext(`${extract("async function validateBudgetPaymentTransition(", "\nasync function reconcileBudgetFinancialStatus(")}\n${extract("async function syncBudgetFinancialEntries(", "\nasync function deleteBudgetFinancialSimulation(")}\n({ validateBudgetPaymentTransition, syncBudgetFinancialEntries })`, ctx);
  const budget = { id: "budget", code: "001", paymentPlan: { enabled: true, months: 1, entry: 0 }, ...(mode === "effective" ? { financialLaunchedAt: "2026-10-01" } : { financialSimulationAt: "2026-10-01" }) };
  return { api, budget, rows, writes, prompts };
}
test("confirmed simulation adjusts paid transactions and replaces received installments", async () => {
  const h = harness();
  const approved = await h.api.validateBudgetPaymentTransition(h.budget, h.budget);
  const result = await h.api.syncBudgetFinancialEntries(h.budget, {}, true, "simulation", { approvedPaidIds: approved });
  assert.equal(h.prompts.length, 1);
  assert.match(h.prompts[0], /Deseja continuar/);
  assert.equal(h.rows.get("cost").amount, 150);
  assert.equal(h.rows.get("cost").status, "paid");
  assert.equal(h.rows.get("cost").paid_at, "2026-10-01");
  assert.equal(h.rows.has("old"), false);
  assert.equal(result.updated, 1);
  assert.equal(result.deleted, 1);
});
test("canceling simulation prevents all financial writes", async () => {
  const h = harness(false);
  await assert.rejects(h.api.syncBudgetFinancialEntries(h.budget, {}, true, "simulation"), /cancelado/);
  assert.equal(h.writes.length, 0);
  await assert.rejects(h.api.validateBudgetPaymentTransition(h.budget, h.budget), /Nenhuma alteração/);
});
test("effective launch still blocks removal of received installments without confirmation", async () => {
  const h = harness(true, "effective");
  await assert.rejects(h.api.validateBudgetPaymentTransition(h.budget, h.budget), /parcelas recebidas/);
  await assert.rejects(h.api.syncBudgetFinancialEntries(h.budget, {}, true, "effective"), /parcelas recebidas/);
  assert.equal(h.prompts.length, 0);
  assert.equal(h.writes.length, 0);
});
test("simulation cannot bypass protection of a paid effective transaction", async () => {
  const h = harness();
  h.rows.get("old").description = "Parcela efetiva";
  await assert.rejects(h.api.validateBudgetPaymentTransition(h.budget, h.budget), /lançamento final/);
  await assert.rejects(h.api.syncBudgetFinancialEntries(h.budget, {}, true, "simulation"), /parcelas recebidas/);
  assert.equal(h.writes.length, 0);
});
