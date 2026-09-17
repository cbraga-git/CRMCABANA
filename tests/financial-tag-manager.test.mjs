import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");

function extract(start, end) {
  const from = app.indexOf(start);
  const to = app.indexOf(end, from);
  assert.ok(from >= 0 && to > from);
  return app.slice(from, to);
}

const helpers = runInNewContext(`${extract("const FINANCIAL_TAGS_MARKER", "\nfunction availableFinancialTags()")}
${extract("function changedFinancialTagNotes(", "\nasync function updateFinancialTag(")}
({ financialEntryTags, financialEntryNotes, notesWithFinancialTags, changedFinancialTagNotes })`);

test("gerenciador oferece alteração e exclusão de tags", () => {
  assert.match(html, /id="manageFinancialTagsBtn"/);
  assert.match(html, /id="financialTagManagerDialog"/);
  assert.match(app, /data-edit-financial-tag=/);
  assert.match(app, /data-delete-financial-tag=/);
});

test("alterar tag preserva observações e evita duplicar tag existente", () => {
  const entry = { notes: helpers.notesWithFinancialTags("Observação importante", ["obra", "cliente"]) };
  const changed = { notes: helpers.changedFinancialTagNotes(entry, "obra", "cliente") };
  assert.equal(helpers.financialEntryNotes(changed), "Observação importante");
  assert.deepEqual(Array.from(helpers.financialEntryTags(changed)), ["cliente"]);
  assert.deepEqual(Array.from(helpers.financialEntryTags(entry)), ["obra", "cliente"]);
});

test("excluir tag não exclui o lançamento nem as demais tags", () => {
  const entry = { notes: helpers.notesWithFinancialTags("Manter texto", ["obra", "urgente"]) };
  const changed = { notes: helpers.changedFinancialTagNotes(entry, "obra", "") };
  assert.equal(helpers.financialEntryNotes(changed), "Manter texto");
  assert.deepEqual(Array.from(helpers.financialEntryTags(changed)), ["urgente"]);
});

test("renomeação atualiza todas as transações que usam a tag", async () => {
  const entries = [
    { id: "1", notes: helpers.notesWithFinancialTags("Texto 1", ["obra"]) },
    { id: "2", notes: helpers.notesWithFinancialTags("Texto 2", ["obra", "cliente"]) },
    { id: "3", notes: helpers.notesWithFinancialTags("Texto 3", ["cliente"]) },
  ];
  const state = {
    financialTagEntries: entries,
    financialEntryDraftTags: ["obra"],
    financialTagEditingName: "obra",
    financialEditingEntryId: null,
    financialTagUpdating: false,
  };
  const message = { textContent: "" };
  const input = { value: "" };
  const dialog = { querySelectorAll: () => [] };
  const changedIds = [];
  const updateFinancialTag = runInNewContext(`${extract("const FINANCIAL_TAGS_MARKER", "\nfunction availableFinancialTags()")}
${extract("function changedFinancialTagNotes(", "\nfunction renderFinancialEntryTagEditor()")}
updateFinancialTag`, {
    state,
    confirm: () => true,
    document: { querySelector: (selector) => ({
      "#financialTagManagerDialog": dialog,
      "#financialTagManagerMessage": message,
      "#financialEntryTagInput": input,
    })[selector] },
    saveFinancialRecord: async (_table, id, payload) => {
      changedIds.push(id);
      entries.find((entry) => entry.id === id).notes = payload.notes;
    },
    loadFinancialRegisters: async () => {},
    fetchFinancialTagEntries: async () => entries,
    renderFinancialEntries: () => {},
    renderFinancialEntryTagEditor: () => {},
    syncFinancialEntryTagAction: () => {},
    renderFinancialTagManager: () => {},
  });
  await updateFinancialTag("obra", "projeto");
  assert.deepEqual(changedIds, ["1", "2"]);
  assert.deepEqual(Array.from(helpers.financialEntryTags(entries[0])), ["projeto"]);
  assert.deepEqual(Array.from(helpers.financialEntryTags(entries[1])), ["projeto", "cliente"]);
  assert.deepEqual(Array.from(helpers.financialEntryTags(entries[2])), ["cliente"]);
  assert.deepEqual(Array.from(state.financialEntryDraftTags), ["projeto"]);
  assert.match(message.textContent, /Tag alterada/);
});
