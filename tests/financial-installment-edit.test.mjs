import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

for (const name of ["crmcabana", "gestaocabana"]) {
const app = await readFile(new URL(`../${name}/app.js`, import.meta.url), "utf8");
test(`${name}: installment dialog preserves Portuguese accents`, () => {
  const dialog = app.slice(app.indexOf("function askFinancialInstallmentChanges("), app.indexOf("async function submitFinancialEntry("));
  for (const text of ["altera\u00e7\u00f5es", "tamb\u00e9m", "\u00e0s outras", "N\u00e3o", "ser\u00e3o"]) assert.ok(dialog.includes(text), text);
  assert.equal(dialog.includes("\ufffd"), false);
  assert.equal(/altera\?\?|N\?o|tamb\?m|ser\?o/.test(dialog), false);
});
const start = app.indexOf("async function submitFinancialEntry(");
const end = app.indexOf("\nfunction renderFinancialImports(", start);
const dateStart = app.indexOf("function addMonthsToFinancialDate(");
const dateEnd = app.indexOf("\nfunction calculateFinancialEntryAmount(", dateStart);

for (const scope of ["company", "braga"]) for (const accept of [true, false]) {
  test(`edição parcelada em ${scope}, confirmação ${accept}`, async () => {
    const values = { financialEntryType: "transfer", financialEntryStatus: "paid", financialEntryAccount: "bank", financialEntryTransferAccount: "destination", financialEntryDescription: "Transferência", financialEntryDueDate: "2026-11-30" };
    const edited = { id: "current", installment_group_id: "group", installment_number: 2, due_date: "2026-10-15", amount: 50, description: "Transferência", notes: "", entry_type: "transfer", account_id: "bank", transfer_account_id: "destination", category_id: null };
    const state = { financialScope: scope, financialEditingEntryId: edited.id, financialEntries: [edited], financialEntryDraftTags: [] };
    const saved = [], patches = [], queries = [];
    let prompts = 0;
    const submit = runInNewContext(`${app.slice(dateStart, dateEnd)}\n${app.slice(start, end)}\nsubmitFinancialEntry`, {
      state, document: { querySelector: (selector) => ({ value: values[selector.slice(1)] || "" }) },
      resolveFinancialEntryAmount: () => 75, normalizeFinancialTag: () => "", formatFinancialDescription: String, notesWithFinancialTags: () => "",
      askFinancialInstallmentChanges: async () => { prompts++; return accept; },
      supabaseTableEndpoint: (_, query, requestedScope) => { assert.equal(requestedScope, scope); return query; }, supabaseHeaders: () => ({}),
      authorizedFetch: async (url, options) => {
        const request = options(); queries.push(url);
        if (request.method === "PATCH") { patches.push({ url, payload: JSON.parse(request.body) }); return { ok: true }; }
        assert.match(url, /installment_group_id=eq.group/);
        return { ok: true, json: async () => [{ id: "earlier", installment_number: 1, status: "pending" }, { id: "later", installment_number: 3, status: "overdue" }, { ...edited, status: "pending" }, { id: "paid", status: "paid" }, { id: "cancelled", status: "cancelled" }] };
      },
      saveFinancialRecord: async (_, id, payload, requestedScope) => { assert.equal(requestedScope, scope); saved.push({ id, payload }); },
      loadFinancialRegisters: async () => {}, renderFinancialEntries() {}, elements: { financialEntryDialog: { close() {} } },
      alert: (message) => { throw new Error(message); },
    });
    await submit({ preventDefault() {} });
    assert.equal(prompts, 1);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].payload.status, "paid");
    assert.equal(patches.length, accept ? 2 : 0);
    if (accept) {
      assert.equal(patches[0].payload.due_date, "2026-10-30");
      assert.equal(patches[1].payload.due_date, "2026-12-30");
      for (const { url, payload } of patches) {
        assert.match(url, /status=eq\.(pending|overdue)/);
        assert.match(url, /installment_group_id=eq.group/);
        assert.equal(payload.amount, 75);
        assert.equal(payload.issue_date, payload.due_date);
        assert.equal(payload.competence_date, payload.due_date);
        assert.equal(Object.hasOwn(payload, "status"), false);
        assert.equal(Object.hasOwn(payload, "paid_at"), false);
        assert.equal(Object.hasOwn(payload, "description"), false);
      }
    }
    assert.equal(state.financialOperations, 0);
  });
}

}
