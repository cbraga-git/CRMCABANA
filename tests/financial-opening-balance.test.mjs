import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function financialAccountBalance(account, endDate, projected) {");
const end = app.indexOf("\nfunction financialCategorySummary", start);
assert.ok(start >= 0 && end > start);

function balanceFor(account, entries, endDate, projected = true) {
  const state = { financialEntries: entries };
  const financialEntryDate = (entry) => entry.due_date;
  const calculate = runInNewContext(`${app.slice(start, end)}\nfinancialAccountBalance`, { state, financialEntryDate });
  return calculate(account, endDate, projected);
}

test("saldo inicial editado ajusta todo o historico, inclusive datas anteriores a referencia", () => {
  const account = { id: "bank", initial_balance: 1000, initial_balance_date: "2026-09-15" };
  const entries = [
    { entry_type: "income", account_id: "bank", amount: 200, status: "paid", due_date: "2026-09-10" },
    { entry_type: "expense", account_id: "bank", amount: 50, status: "paid", due_date: "2026-09-11" },
    { entry_type: "expense", account_id: "bank", amount: 25, status: "pending", due_date: "2026-09-12" },
  ];
  assert.equal(balanceFor(account, entries, "2026-09-09"), 1000);
  assert.equal(balanceFor(account, entries, "2026-09-10"), 1200);
  assert.equal(balanceFor(account, entries, "2026-09-11"), 1150);
  assert.equal(balanceFor(account, entries, "2026-09-12"), 1125);
  assert.equal(balanceFor(account, entries, "2026-09-12", false), 1150);
  assert.equal(balanceFor({ ...account, initial_balance: 1300 }, entries, "2026-09-10"), 1500);
  assert.equal(balanceFor({ ...account, initial_balance: 1300 }, entries, "2026-09-12"), 1425);
});

test("transferencias e cancelamentos preservam a regra de saldo", () => {
  const account = { id: "bank", initial_balance: 300, initial_balance_date: "2026-10-01" };
  const entries = [
    { entry_type: "transfer", account_id: "bank", transfer_account_id: "other", amount: 50, status: "paid", due_date: "2026-09-01" },
    { entry_type: "transfer", account_id: "other", transfer_account_id: "bank", amount: 20, status: "paid", due_date: "2026-09-01" },
    { entry_type: "income", account_id: "bank", amount: 999, status: "cancelled", due_date: "2026-09-01" },
  ];
  assert.equal(balanceFor(account, entries, "2026-09-01"), 270);
});
