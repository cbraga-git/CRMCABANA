import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf('const FINANCIAL_EVOLUTION_BANK_ACCOUNTS =');
const end = app.indexOf('\nfunction renderFinancialBalanceChart', start);
assert.ok(start >= 0 && end > start);

const accounts = [
  { id: "bank-1", account_type: "bank", active: true },
  { id: "bank-2", account_type: "bank", active: true },
  { id: "cash", account_type: "cash", active: true },
  { id: "inactive-bank", account_type: "bank", active: false },
];
const state = { financialAccounts: accounts, financialEvolutionAccountId: "" };
const getAccounts = runInNewContext(`${app.slice(start, end)}\nfinancialEvolutionAccounts`, { state });

test("evolução anual filtra somente contas bancárias ativas", () => {
  state.financialEvolutionAccountId = "__bank_accounts__";
  assert.deepEqual(Array.from(getAccounts(), (account) => account.id), ["bank-1", "bank-2"]);
});

test("evolução anual mantém seleção de todas ou de uma conta", () => {
  state.financialEvolutionAccountId = "";
  assert.deepEqual(Array.from(getAccounts(), (account) => account.id), ["bank-1", "bank-2", "cash"]);
  state.financialEvolutionAccountId = "cash";
  assert.deepEqual(Array.from(getAccounts(), (account) => account.id), ["cash"]);
});
