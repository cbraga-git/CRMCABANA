import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
for (const app of ["crmcabana", "gestaocabana"]) {
  const source = await readFile(new URL(`../${app}/app.js`, import.meta.url), "utf8");
  const start = source.indexOf("async function openBudgetFinancialTransactions(");
  const end = source.indexOf("function openBudgetFinancialDialog()", start);
  test(`${app}: opens exact budget entries in company transactions without date or account restrictions`, async () => {
    const state = { budgetEditingId: "b1", financialSelectedEntryIds: new Set(["old"]), financialScope: "braga" };
    let renders = 0;
    const open = runInNewContext(`${source.slice(start, end)};openBudgetFinancialTransactions`, {
      state, sourceBudgetClient: () => ({ id: "client1", name: "Client" }),
      budgetForEditing: () => ({ id: "b1", code: "B1", ...(app === "gestaocabana" ? { financialLinkedEntryIds: ["legacy-entry", "entry-1"] } : {}) }),
      budgetFinancialEntryIds: async () => [["income-1", "entry-1"], ["cost", "entry-2"]],
      document: { querySelector: () => ({ close() {} }) },
      showView: async (view, id, scope) => { state.view = view; state.financialScope = scope; },
      renderFinancialEntries: () => renders++, alert: (message) => { throw new Error(message); },
    });
    const button = {};
    await open(button);
    assert.equal(state.view, "financeTransactions");
    assert.equal(state.financialScope, "company");
    assert.deepEqual([...state.financialBudgetFilter.ids], app === "gestaocabana" ? ["entry-1", "entry-2", "legacy-entry"] : ["entry-1", "entry-2"]);
    assert.equal(state.financialBudgetFilter.origin.clientId, "client1");
    assert.equal(state.financialBudgetFilter.origin.budgetId, "b1");
    assert.equal(state.financialEntryFilters.accountId, "");
    assert.equal(state.financialEntryMonthFilter, "");
    assert.equal(state.financialEntryShowDailyBalance, false);
    assert.equal(state.financialSelectedEntryIds.size, 0);
    assert.equal(button.disabled, false);
    assert.equal(renders, 1);
  });
}

for (const app of ["crmcabana", "gestaocabana"]) {
  const source = await readFile(new URL(`../${app}/app.js`, import.meta.url), "utf8");
  test(`${app}: summary and actual transaction filter run without undefined variables`, () => {
    const state = { view: "financeTransactions", financialScope: "company", financialBudgetFilter: { ids: new Set(["linked"]), label: "Budget" }, financialEntryFilters: {}, financialAccounts: [], financialEntries: [
      { id: "linked", entry_type: "income", amount: 50, status: "pending", date: "2026-10-22" },
      { id: "other", entry_type: "income", amount: 999, status: "pending", date: "2026-10-22" },
    ] };
    const nodes = new Map();
    const context = { state, document: { querySelector: (id) => { if (!nodes.has(id)) nodes.set(id, { querySelector: () => ({}) }); return nodes.get(id); } }, BRL: { format: String }, financialEntryDate: (entry) => entry.date,
      financialAccountBalance: () => 0, financialEntryViewType: () => "", financialMonthBounds: () => ({ start: "2026-10-01", end: "2026-10-31" }), financialAccountFilterMatches: () => true, FINANCIAL_BANK_ACCOUNTS_FILTER: "__bank_accounts__" };
    const start = source.indexOf("function renderFinancialTransactionSummary(");
    const end = source.indexOf("const financialTableSorts", start);
    const summary = source.slice(start, end);
    const listStart = source.indexOf("function renderFinancialEntries(view = state.view)");
    const listEnd = source.indexOf("  const eligibleIds =", listStart);
    const render = runInNewContext(`${summary}\n${source.slice(listStart, listEnd)} return entries; }\nrenderFinancialEntries`, context);
    assert.deepEqual(Array.from(render(), (entry) => entry.id), ["linked"]);
    assert.equal(nodes.get("#financialTransactionIncome").textContent, "50");
    state.financialBudgetFilter = null;
    assert.equal(render().length, 2);
  });
}

for (const app of ["crmcabana", "gestaocabana"]) {
  const source = await readFile(new URL(`../${app}/app.js`, import.meta.url), "utf8");
  test(`${app}: returns to the original budget and client`, async () => {
    const state = { view: "financeTransactions", financialBudgetFilter: { origin: { view: "budget", clientId: "client2", budgetId: "budget3" } } };
    let opened;
    const start = source.indexOf("async function returnToFinancialBudget()");
    const end = source.indexOf('document.querySelector("#returnToFinancialBudget")', start);
    const back = runInNewContext(`${source.slice(start, end)};returnToFinancialBudget`, { state,
      showView: async (view) => { state.view = view; },
      openBudgetEditor: async (clientId, options) => { opened = [clientId, options.budgetId]; },
    });
    await back();
    assert.equal(state.view, "budget");
    assert.deepEqual(opened, ["client2", "budget3"]);
  });
}
