import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function renderFinancialDailyBalanceBreaks(table) {");
const end = app.indexOf("\nfunction initializeFinancialTableSorting()", start);
assert.ok(start >= 0 && end > start);

function makeTable(dates) {
  const body = {
    rows: [],
    querySelectorAll() {
      return this.rows.filter((row) => row.className?.includes("financial-daily-balance-row") || row.className?.includes("financial-filter-balance-row"));
    },
    appendChild(row) { this.rows.push(row); },
  };
  for (const [id, date] of dates) {
    const row = {
      dataset: { financialEntryId: id, financialEntryDate: date },
      after(next) { body.rows.splice(body.rows.indexOf(row) + 1, 0, next); },
    };
    body.rows.push(row);
  }
  return { tBodies: [body] };
}

test("saldo diário acumula somente os lançamentos filtrados, sem total redundante", () => {
  const state = {
    view: "financeTransactions",
    financialEntryFilters: { search: "pix", type: "", accountId: "bank", categoryId: "", status: "" },
    financialEntryAccountFilter: "",
    financialEntryShowDailyBalance: true,
    financialAccounts: [
      { id: "bank", active: true },
      { id: "other", active: true },
    ],
    financialEntries: [
      { id: "1", date: "2026-09-17", status: "paid", entry_type: "income", amount: 100 },
      { id: "2", date: "2026-09-16", status: "paid", entry_type: "expense", amount: 20 },
      { id: "3", date: "2026-09-16", status: "paid", entry_type: "income", amount: 5000 },
    ],
  };
  const table = makeTable([["1", "2026-09-17"], ["2", "2026-09-16"]]);
  const document = {
    createElement() {
      const row = {
        className: "",
        innerHTML: "",
        remove() { table.tBodies[0].rows.splice(table.tBodies[0].rows.indexOf(row), 1); },
      };
      return row;
    },
  };
  const render = runInNewContext(`${app.slice(start, end)}\nrenderFinancialDailyBalanceBreaks`, {
    state,
    document,
    BRL: { format: (value) => `R$ ${value}` },
    financialAccountBalance: (account, date) => account.id === "bank" ? (date.endsWith("17") ? 1000 : 900) : 5000,
    financialEntryDate: (entry) => entry.date,
  });

  render(table);
  const summaries = () => table.tBodies[0].rows.filter((row) => row.className);
  assert.equal(summaries().filter((row) => row.className === "financial-daily-balance-row").length, 2);
  assert.ok(summaries().some((row) => row.innerHTML.includes("R$ -20")));
  assert.ok(summaries().some((row) => row.innerHTML.includes("R$ 80")));
  assert.ok(summaries().every((row) => row.innerHTML.includes("Saldo do filtro até o dia")));
  assert.ok(summaries().every((row) => !row.innerHTML.includes("R$ 1000")));

  state.financialEntryShowDailyBalance = false;
  render(table);
  assert.equal(summaries().filter((row) => row.className === "financial-daily-balance-row").length, 0);
  assert.equal(summaries().filter((row) => row.className === "financial-filter-balance-row").length, 1);
  assert.ok(summaries()[0].innerHTML.includes("R$ 80"));
});

test("filtro apenas de data também usa o saldo filtrado; sem filtro mantém saldo da conta", () => {
  const state = {
    view: "financeTransactions",
    financialEntryFilters: { search: "", type: "", accountId: "", categoryId: "", status: "", startDate: "2026-09-16", endDate: "" },
    financialEntryAccountFilter: "",
    financialEntryShowDailyBalance: true,
    financialAccounts: [{ id: "bank", active: true }],
    financialEntries: [{ id: "1", date: "2026-09-16", status: "paid", entry_type: "expense", amount: 20 }],
  };
  const table = makeTable([["1", "2026-09-16"]]);
  const document = {
    createElement() {
      const row = { className: "", innerHTML: "", remove() { table.tBodies[0].rows.splice(table.tBodies[0].rows.indexOf(row), 1); } };
      return row;
    },
  };
  const render = runInNewContext(`${app.slice(start, end)}\nrenderFinancialDailyBalanceBreaks`, {
    state,
    document,
    BRL: { format: (value) => `R$ ${value}` },
    financialAccountBalance: () => 900,
    financialEntryDate: (entry) => entry.date,
  });
  render(table);
  assert.ok(table.tBodies[0].rows[1].innerHTML.includes("R$ -20"));
  state.financialEntryFilters.startDate = "";
  render(table);
  assert.ok(table.tBodies[0].rows[1].innerHTML.includes("R$ 900"));
});
