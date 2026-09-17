import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const start = app.indexOf("function financialAccountFilterMatches(");
const end = app.indexOf("\nfunction formatFinancialDate(", start);
assert.ok(start >= 0 && end > start);
const { financialAccountFilterMatches, financialAccountFilterMovement } = runInNewContext(
  `const FINANCIAL_BANK_ACCOUNTS_FILTER = "__bank_accounts__";\n${app.slice(start, end)}\n({ financialAccountFilterMatches, financialAccountFilterMovement })`
);

const banks = new Set(["mercado-pago", "itau"]);
const expense = { entry_type: "expense", account_id: "mercado-pago", amount: 30 };
const cashIncome = { entry_type: "income", account_id: "cash", amount: 90 };
const bankTransfer = { entry_type: "transfer", account_id: "mercado-pago", transfer_account_id: "itau", amount: 50 };
const cashToBank = { entry_type: "transfer", account_id: "cash", transfer_account_id: "itau", amount: 40 };
const bankToCash = { entry_type: "transfer", account_id: "itau", transfer_account_id: "cash", amount: 20 };

test("filtro padrão seleciona contas bancárias e preserva o mês", () => {
  assert.match(html, /id="financialEntryFilterAccount"[^>]*><option value="">Todas as contas<\/option><option value="__bank_accounts__" selected>Contas bancárias<\/option>/);
  assert.match(app, /financialEntryFilters: \{[^\n]*accountId: "__bank_accounts__"/);
  assert.match(app, /filters\.accountId !== FINANCIAL_BANK_ACCOUNTS_FILTER/);
});

test("contas bancárias inclui lançamentos e transferências relacionadas", () => {
  assert.equal(financialAccountFilterMatches(expense, "__bank_accounts__", banks), true);
  assert.equal(financialAccountFilterMatches(cashIncome, "__bank_accounts__", banks), false);
  assert.equal(financialAccountFilterMatches(bankTransfer, "__bank_accounts__", banks), true);
  assert.equal(financialAccountFilterMatches(cashToBank, "__bank_accounts__", banks), true);
  assert.equal(financialAccountFilterMatches(bankToCash, "__bank_accounts__", banks), true);
  assert.equal(financialAccountFilterMatches(cashIncome, "", banks), true);
});

test("saldo do filtro soma somente os movimentos das contas bancárias", () => {
  assert.equal(financialAccountFilterMovement(expense, "__bank_accounts__", banks), -30);
  assert.equal(financialAccountFilterMovement(cashIncome, "__bank_accounts__", banks), 0);
  assert.equal(financialAccountFilterMovement(bankTransfer, "__bank_accounts__", banks), 0);
  assert.equal(financialAccountFilterMovement(cashToBank, "__bank_accounts__", banks), 40);
  assert.equal(financialAccountFilterMovement(bankToCash, "__bank_accounts__", banks), -20);
  assert.equal(financialAccountFilterMovement(bankTransfer, "", banks), 0);
  assert.equal(financialAccountFilterMovement(bankTransfer, "itau", banks), 50);
});
