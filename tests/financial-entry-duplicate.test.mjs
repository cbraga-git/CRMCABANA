import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function openFinancialEntryDialog(entryId = null, duplicate = false) {");
const end = app.indexOf("\nasync function submitFinancialEntry", start);
assert.ok(start >= 0 && end > start);

test("menu de transacoes oferece duplicar entre editar e excluir", () => {
  assert.match(app, /data-edit-financial-entry="\$\{entry\.id\}"[\s\S]*?data-duplicate-financial-entry="\$\{entry\.id\}"[\s\S]*?data-delete-financial-entry="\$\{entry\.id\}"/);
  assert.match(app, /openFinancialEntryDialog\(duplicate\.dataset\.duplicateFinancialEntry, true\)/);
});

test("duplicar abre copia preenchida sem vinculo com o registro original", () => {
  const fields = new Map();
  const document = { querySelector(selector) { if (!fields.has(selector)) fields.set(selector, { value: "", textContent: "", setCustomValidity() {} }); return fields.get(selector); } };
  let opened = false;
  const entry = {
    id: "entry-1", entry_type: "expense", status: "paid", description: "Montagem", amount: 310.5,
    account_id: "bank", category_id: "category", issue_date: "2026-09-01", competence_date: "2026-09-02",
    due_date: "2026-09-30", notes: "Observacao original", installment_count: 2,
  };
  const state = { financialAccounts: [{ id: "bank", active: true }], financialEntries: [entry], financialEditingEntryId: "old", financialEntryDraftTags: [] };
  const elements = { financialEntryForm: { reset() {} }, financialEntryDialog: { showModal() { opened = true; } } };
  const open = runInNewContext(`${app.slice(start, end)}\nopenFinancialEntryDialog`, {
    state, elements, document, fillFinancialEntryOptions() {}, formatFinancialDescription: (value) => value || "",
    financialEntryViewType: () => null, financialEntryTags: () => ["cliente"], financialEntryNotes: (item) => item?.notes || "",
    renderFinancialEntryTagEditor() {}, syncFinancialEntryTagAction() {}, syncFinancialEntryTypeFields() {}, alert() {},
  });
  open("entry-1", true);
  assert.equal(opened, true);
  assert.equal(state.financialEditingEntryId, null);
  assert.equal(fields.get("#financialEntryDialogTitle").textContent, "Duplicar lançamento");
  assert.equal(fields.get("#financialEntryAmount").value, 310.5);
  assert.equal(fields.get("#financialEntryDescription").value, "Montagem");
  assert.equal(fields.get("#financialEntryStatus").value, "paid");
  assert.equal(fields.get("#financialEntryAccount").value, "bank");
  assert.equal(fields.get("#financialEntryDueDate").value, "2026-09-30");
  assert.equal(fields.get("#financialEntryNotes").value, "Observacao original");
  assert.deepEqual(state.financialEntryDraftTags, ["cliente"]);
  assert.match(app, /saveFinancialRecord\("crm_financial_entries", state\.financialEditingEntryId,/);
});
