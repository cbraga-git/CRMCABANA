import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function renderFinancialDailyBalanceBreaks(table) {");
const end = app.indexOf("\nfunction initializeFinancialTableSorting()", start);
assert.ok(start >= 0 && end > start);
const helpersStart = app.indexOf("function financialAccountFilterMatches(");
const helpersEnd = app.indexOf("\nfunction formatFinancialDate(", helpersStart);
assert.ok(helpersStart >= 0 && helpersEnd > helpersStart);
const balanceSource = `const FINANCIAL_BANK_ACCOUNTS_FILTER = "__bank_accounts__";\n${app.slice(helpersStart, helpersEnd)}\n${app.slice(start, end)}\nrenderFinancialDailyBalanceBreaks`;

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
      { id: "1", date: "2026-09-17", status: "paid", entry_type: "income", account_id: "bank", amount: 100 },
      { id: "2", date: "2026-09-16", status: "paid", entry_type: "expense", account_id: "bank", amount: 20 },
      { id: "3", date: "2026-09-16", status: "paid", entry_type: "income", account_id: "other", amount: 5000 },
      { id: "4", date: "2026-09-15", status: "pending", entry_type: "income", account_id: "bank", amount: 200 },
      { id: "5", date: "2026-09-17", status: "pending", entry_type: "income", account_id: "bank", amount: 70 },
      { id: "6", date: "2026-09-17", status: "overdue", entry_type: "expense", account_id: "bank", amount: 30 },
      { id: "7", date: "2026-09-17", status: "cancelled", entry_type: "income", account_id: "bank", amount: 999 },
      { id: "8", date: "2026-09-17", status: "pending", entry_type: "income", account_id: "other", amount: 5000 },
      { id: "9", date: "2026-09-17", status: "pending", entry_type: "transfer", account_id: "bank", transfer_account_id: "other", amount: 10 },
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
  const render = runInNewContext(balanceSource, {
    state,
    document,
    BRL: { format: (value) => `R$ ${value}` },
    financialAccountBalance: (account, date, projected) => account.id === "bank"
      ? (projected ? (date.endsWith("17") ? 1000 : 900) : (date.endsWith("17") ? 800 : 700))
      : 5000,
    financialEntryDate: (entry) => entry.date,
  });

  render(table);
  const summaries = () => table.tBodies[0].rows.filter((row) => row.className);
  assert.equal(summaries().filter((row) => row.className === "financial-daily-balance-row").length, 2);
  assert.ok(summaries().some((row) => row.innerHTML.includes("R$ 900")));
  assert.ok(summaries().some((row) => row.innerHTML.includes("R$ 1000")));
  assert.ok(summaries().every((row) => row.innerHTML.includes("Saldo final do dia previsto")));
  assert.ok(summaries().every((row) => row.innerHTML.includes("Saldo final do dia pendente")));
  assert.ok(summaries().every((row) => row.innerHTML.includes("Saldo final do dia realizado")));
  assert.ok(summaries()[0].innerHTML.includes("Saldo final do dia pendente <strong>R$ 30</strong>"));
  assert.ok(summaries()[1].innerHTML.includes("Saldo final do dia pendente <strong>R$ 0</strong>"));
  assert.ok(summaries().some((row) => row.innerHTML.includes("R$ 800")));
  assert.ok(summaries().every((row) => !row.innerHTML.includes("R$ 5000")));

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
  const render = runInNewContext(balanceSource, {
    state,
    document,
    BRL: { format: (value) => `R$ ${value}` },
    financialAccountBalance: () => 900,
    financialEntryDate: (entry) => entry.date,
  });
  render(table);
  assert.ok(table.tBodies[0].rows[1].innerHTML.includes("R$ 900"));
  state.financialEntryFilters.startDate = "";
  render(table);
  assert.ok(table.tBodies[0].rows[1].innerHTML.includes("R$ 900"));
});

test("contas bancárias por padrão usa saldo bancário; combinado com busca usa só os lançamentos exibidos", () => {
  const state = {
    view: "financeTransactions",
    financialEntryFilters: { search: "", type: "", accountId: "__bank_accounts__", categoryId: "", status: "", startDate: "", endDate: "" },
    financialEntryAccountFilter: "",
    financialEntryShowDailyBalance: true,
    financialAccounts: [{ id: "bank", account_type: "bank", active: true }, { id: "cash", account_type: "cash", active: true }],
    financialEntries: [{ id: "1", date: "2026-09-16", status: "paid", entry_type: "income", account_id: "bank", amount: 100 }],
  };
  const table = makeTable([["1", "2026-09-16"]]);
  const document = {
    createElement() {
      const row = { className: "", innerHTML: "", remove() { table.tBodies[0].rows.splice(table.tBodies[0].rows.indexOf(row), 1); } };
      return row;
    },
  };
  const render = runInNewContext(balanceSource, {
    state,
    document,
    BRL: { format: (value) => `R$ ${value}` },
    financialAccountBalance: (account) => account.id === "bank" ? 900 : 5000,
    financialEntryDate: (entry) => entry.date,
  });
  render(table);
  assert.ok(table.tBodies[0].rows[1].innerHTML.includes("R$ 900"));
  state.financialEntryFilters.search = "pix";
  render(table);
  assert.ok(table.tBodies[0].rows[1].innerHTML.includes("R$ 900"));
});
