import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../gestaocabana/app.js", import.meta.url), "utf8");
const extract = (a, b) => source.slice(source.indexOf(a), source.indexOf(b, source.indexOf(a)));
test("overview selection applies to balances, monthly entries, category charts and annual accounts", () => {
  const nodes = new Map();
  const charts = [];
  const state = { financialDashboardMonth: "2026-10", financialDashboardAccountFilter: "bank|cash", financialAccounts: [
    { id: "bank", name: "Banco", account_type: "bank", active: true, balance: 100 },
    { id: "cash", name: "Caixa", account_type: "cash", active: true, balance: 20 },
    { id: "other", name: "Outro", account_type: "bank", active: true, balance: 300 },
  ], financialEntries: [
    { id: "1", account_id: "bank", entry_type: "income", amount: 50, date: "2026-10-10" },
    { id: "2", account_id: "cash", entry_type: "expense", amount: 10, date: "2026-10-10" },
    { id: "3", account_id: "other", entry_type: "income", amount: 900, date: "2026-10-10" },
    { id: "4", account_id: "bank", entry_type: "income", status: "cancelled", amount: 1000, date: "2026-10-10" },
    { id: "5", account_id: "bank", entry_type: "income", amount: 500, date: "2026-09-10" },
  ] };
  const { render, annual } = runInNewContext(`${extract("function financialFilterValues(", "function renderFinancialMultiFilter(")}\n${extract("function financialEvolutionAccounts(", "function renderFinancialBalanceChart(")}\n${extract("function renderFinancialDashboard(", "const FINANCIAL_ACCOUNT_TYPES")}\n({render:renderFinancialDashboard,annual:financialEvolutionAccounts})`, {
    state, FINANCIAL_BANK_ACCOUNTS_FILTER: "__bank_accounts__", document: { querySelector: (id) => { if (!nodes.has(id)) nodes.set(id, {}); return nodes.get(id); } },
    BRL: { format: String }, financialMonthBounds: () => ({ start: "2026-10-01", end: "2026-10-31" }), financialEntryDate: (e) => e.date,
    financialAccountBalance: (a) => a.balance, escapeHtml: String, renderFinancialMultiFilter() {}, renderFinancialEvolution() {},
    financialCategorySummary: (entries, type) => entries.filter((e) => e.entry_type === type && e.status !== "cancelled").map((e) => e.id),
    renderFinancialDonut: (id, legend, entries) => charts.push(Array.from(entries)),
  });
  render();
  assert.equal(nodes.get("#financialDashboardBalance").textContent, "120");
  assert.equal(nodes.get("#financialDashboardProjected").textContent, "120");
  assert.equal(nodes.get("#financialDashboardIncome").textContent, "50");
  assert.equal(nodes.get("#financialDashboardExpense").textContent, "10");
  assert.deepEqual(charts, [["2"], ["1"]]);
  assert.deepEqual(Array.from(annual(), (a) => a.id), ["bank", "cash"]);
  state.financialDashboardAccountFilter = "__bank_accounts__";
  assert.deepEqual(Array.from(annual(), (a) => a.id), ["bank", "other"]);
  state.financialDashboardAccountFilter = "";
  render();
  assert.equal(nodes.get("#financialDashboardBalance").textContent, "420");
});
