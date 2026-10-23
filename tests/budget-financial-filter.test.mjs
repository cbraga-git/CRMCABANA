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
      state, sourceBudgetClient: () => ({ name: "Client" }),
      budgetForEditing: () => ({ id: "b1", code: "B1" }),
      budgetFinancialEntryIds: async () => [["income-1", "entry-1"], ["cost", "entry-2"]],
      document: { querySelector: () => ({ close() {} }) },
      showView: async (view, id, scope) => { state.view = view; state.financialScope = scope; },
      renderFinancialEntries: () => renders++, alert: (message) => { throw new Error(message); },
    });
    const button = {};
    await open(button);
    assert.equal(state.view, "financeTransactions");
    assert.equal(state.financialScope, "company");
    assert.deepEqual([...state.financialBudgetFilter.ids], ["entry-1", "entry-2"]);
    assert.equal(state.financialEntryFilters.accountId, "");
    assert.equal(state.financialEntryMonthFilter, "");
    assert.equal(state.financialEntryShowDailyBalance, false);
    assert.equal(state.financialSelectedEntryIds.size, 0);
    assert.equal(button.disabled, false);
    assert.equal(renders, 1);
  });
}
