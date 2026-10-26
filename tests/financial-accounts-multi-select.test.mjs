import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const app = await readFile(new URL("../gestaocabana/app.js", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));
for (const scope of ["company", "braga"]) {
  test(`${scope}: selected accounts filter cards and totals together with account type`, () => {
    const nodes = new Map();
    const state = { financialScope: scope, financialDashboardMonth: "2026-10", financialAccountsSelectedFilter: "bank|cash|inactive", financialAccounts: [
      { id: "bank", name: "01 Banco", account_type: "bank", active: true, balance: 100 },
      { id: "cash", name: "02 Caixa", account_type: "cash", active: true, balance: 20 },
      { id: "other", name: "03 Outro", account_type: "bank", active: true, balance: 300 },
      { id: "inactive", name: "04 Inativa", account_type: "bank", active: false, balance: 50 },
    ] };
    const elements = { financialAccountRows: {} };
    const render = runInNewContext(`${extract("function financialFilterValues(", "function financialAccountSelected(")}\n${extract("function renderFinancialAccounts(", "function renderFinancialCategories(")}\nrenderFinancialAccounts`, {
      state, elements, document: { querySelector: (id) => { if (!nodes.has(id)) nodes.set(id, {}); return nodes.get(id); } },
      financialMonthBounds: () => ({ end: "2026-10-31" }), financialSortCollator: new Intl.Collator("pt-BR"),
      BRL: { format: String }, financialAccountBalance: (account) => account.balance,
      escapeHtml: String, financialAccountBrand: () => "", FINANCIAL_ACCOUNT_TYPES: {}, renderFinancialMultiFilter() {},
    });
    const check = (visible, total) => {
      render();
      for (const id of ["bank", "cash", "other", "inactive"]) assert.equal(elements.financialAccountRows.innerHTML.includes(`data-edit-financial-account="${id}"`), visible.includes(id));
      assert.equal(nodes.get("#financialAccountsBalance").textContent, String(total));
      assert.equal(nodes.get("#financialAccountsProjected").textContent, String(total));
    };
    check(["bank", "cash", "inactive"], 120);
    state.financialAccountTypeFilter = "bank";
    check(["bank", "inactive"], 100);
    state.financialAccountTypeFilter = "all";
    state.financialAccountsSelectedFilter = "";
    check(["bank", "cash", "other", "inactive"], 420);
    state.financialAccountsSelectedFilter = "deleted-account";
    check([], 0);
  });
}
