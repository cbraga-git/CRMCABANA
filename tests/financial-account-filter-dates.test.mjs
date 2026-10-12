import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));

for (const scope of ["company", "braga"]) {
  test(`filtro de contas e saldos em ${scope}`, () => {
    const nodes = new Map();
    const document = { querySelector: (selector) => { if (!nodes.has(selector)) nodes.set(selector, {}); return nodes.get(selector); } };
    const state = { financialScope: scope, financialDashboardMonth: "2026-10", financialAccounts: [
      { id: "bank", name: "01 Banco", account_type: "bank", active: true, balance: 100 },
      { id: "cash", name: "02 Caixa", account_type: "cash", active: true, balance: 20 },
      { id: "card", name: "03 Cartão", account_type: "credit_card", active: true, balance: 30 },
    ] };
    const elements = { financialAccountRows: {} };
    const render = runInNewContext(`${extract("function renderFinancialAccounts(", "\nfunction renderFinancialCategories(")}\nrenderFinancialAccounts`, {
      state, elements, document, financialMonthBounds: () => ({ end: "2026-10-31" }),
      financialSortCollator: new Intl.Collator("pt-BR"), BRL: { format: String },
      financialAccountBalance: (account) => account.balance, escapeHtml: String,
      financialAccountBrand: () => "", FINANCIAL_ACCOUNT_TYPES: {},
    });
    for (const [filter, ids, balance] of [["all", ["bank", "cash", "card"], 150], ["bank", ["bank"], 100], ["other", ["cash", "card"], 50]]) {
      state.financialAccountTypeFilter = filter;
      render();
      for (const id of ["bank", "cash", "card"]) assert.equal(elements.financialAccountRows.innerHTML.includes(`data-edit-financial-account="${id}"`), ids.includes(id));
      assert.equal(nodes.get("#financialAccountsBalance").textContent, String(balance));
      assert.equal(nodes.get("#financialAccountsProjected").textContent, String(balance));
    }
  });

  test(`salvamento usa vencimento para emissão e competência em ${scope}`, async () => {
    const values = { financialEntryType: "expense", financialEntryStatus: "pending", financialEntryDueDate: "2026-10-15", financialEntryAccount: "bank", financialEntryDescription: "Compra", financialEntryInstallment: "true", financialEntryInstallmentCount: "3" };
    const records = [];
    const state = { financialScope: scope, financialEntryDraftTags: [] };
    const save = runInNewContext(`${extract("async function submitFinancialEntry(", "\nfunction renderFinancialImports(")}\nsubmitFinancialEntry`, {
      state, document: { querySelector: (selector) => ({ value: values[selector.slice(1)] || "", reportValidity() {} }) },
      resolveFinancialEntryAmount: () => 50, normalizeFinancialTag: () => "", formatFinancialDescription: String,
      notesWithFinancialTags: () => "", crypto: { randomUUID: () => "id" },
      addMonthsToFinancialDate: (date, offset) => offset === 0 ? date : `2026-${String(10 + offset).padStart(2, "0")}-15`,
      saveFinancialRecord: async (_, id, payload) => records.push(...(Array.isArray(payload) ? payload : [payload])),
      loadFinancialRegisters: async () => {}, renderFinancialEntries() {}, elements: { financialEntryDialog: { close() {} } },
      alert: (message) => { throw new Error(message); },
    });
    await save({ preventDefault() {} });
    assert.equal(records.length, 3);
    for (const [index, record] of records.entries()) {
      assert.equal(record.due_date, `2026-${10 + index}-15`);
      assert.equal(record.issue_date, record.due_date);
      assert.equal(record.competence_date, record.due_date);
    }
    records.length = 0;
    values.financialEntryInstallment = "false";
    values.financialEntryDueDate = "2027-01-20";
    state.financialEditingEntryId = "existing";
    await save({ preventDefault() {} });
    assert.equal(records[0].issue_date, "2027-01-20");
    assert.equal(records[0].competence_date, "2027-01-20");
  });
}
