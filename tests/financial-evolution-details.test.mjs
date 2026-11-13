import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

for (const app of ["crmcabana", "gestaocabana"]) {
  const source = await readFile(new URL(`../${app}/app.js`, import.meta.url), "utf8");
  test(`${app}: evolução lista lançamentos e reconcilia valores e saldo acumulado`, () => {
    const state = { financialEntries: [
      { id: "prior", entry_type: "income", account_id: "a", amount: 20, due_date: "2026-09-01" },
      { id: "income", entry_type: "income", account_id: "a", amount: 100, due_date: "2026-10-01" },
      { id: "expense", entry_type: "expense", account_id: "a", amount: 30, due_date: "2026-10-02" },
      { id: "in", entry_type: "transfer", account_id: "other", transfer_account_id: "a", amount: 40, due_date: "2026-10-03" },
      { id: "out", entry_type: "transfer", account_id: "a", transfer_account_id: "other", amount: 10, due_date: "2026-10-04" },
      { id: "internal", entry_type: "transfer", account_id: "a", transfer_account_id: "b", amount: 15, due_date: "2026-10-05" },
      { id: "cancelled", entry_type: "income", account_id: "a", amount: 999, status: "cancelled", due_date: "2026-10-06" },
      { id: "future", entry_type: "income", account_id: "a", amount: 999, due_date: "2026-11-01" },
      { id: "unselected", entry_type: "income", account_id: "other", amount: 999, due_date: "2026-10-01" },
    ] };
    const start = source.indexOf("function financialEvolutionDetails(");
    const end = source.indexOf("function openFinancialEvolutionDetails(", start);
    const details = runInNewContext(source.slice(start, end) + "\nfinancialEvolutionDetails", {
      state, financialEvolutionAccounts: () => [{ id: "a", initial_balance: 50 }, { id: "b", initial_balance: 5 }],
      financialEntryDate: (entry) => entry.due_date,
      financialMonthBounds: () => ({ start: "2026-10-01", end: "2026-10-31" }),
    });
    for (const [kind, ids, total] of [
      ["income", ["income"], 100], ["expense", ["expense"], 30],
      ["incoming", ["in", "internal"], 55], ["outgoing", ["out", "internal"], 25],
      ["balance", ["prior", "income", "expense", "in", "out", "internal"], 175],
    ]) {
      const result = details("2026-10", kind);
      assert.deepEqual(Array.from(result.entries, (entry) => entry.id), ids);
      assert.equal(result.total, total);
    }
    state.financialEntries = [];
    assert.equal(details("2026-10", "balance").total, 55);
    assert.equal(details("2026-10", "income").entries.length, 0);
  });
}
