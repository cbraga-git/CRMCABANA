import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const app = await readFile(new URL('../gestaocabana/app.js', import.meta.url), 'utf8');
const helpers = app.slice(app.indexOf('function financialFilterValues('), app.indexOf('\nfunction renderFinancialMultiFilter('));
const bankAccountIds = new Set(['bank-a', 'bank-b']);
const context = { FINANCIAL_BANK_ACCOUNTS_FILTER: '__bank_accounts__' };
const api = runInNewContext(`${helpers}\n({financialFilterMatches, financialAccountFilterMatches, financialAccountFilterMovement})`, context);
const transfer = {entry_type: 'transfer', account_id: 'bank-a', transfer_account_id: 'bank-b', amount: 100};

test('multiple account filters include both sides and count each movement once', () => {
  assert.equal(api.financialAccountFilterMatches(transfer, 'bank-b|cash', bankAccountIds), true);
  assert.equal(api.financialAccountFilterMatches(transfer, 'other|cash', bankAccountIds), false);
  assert.equal(api.financialAccountFilterMovement(transfer, 'bank-a|bank-b', bankAccountIds), 0);
  assert.equal(api.financialAccountFilterMovement(transfer, 'bank-a|cash', bankAccountIds), -100);
  assert.equal(api.financialAccountFilterMovement(transfer, 'bank-b|cash', bankAccountIds), 100);
  assert.equal(api.financialAccountFilterMovement(transfer, '__bank_accounts__|bank-a', bankAccountIds), 0);
  assert.equal(api.financialAccountFilterMovement({...transfer, entry_type: 'income'}, '__bank_accounts__|bank-a', bankAccountIds), 100);
});

test('transactions combine alternatives within each field and intersect different fields', () => {
  const start = app.indexOf('  const entries = state.financialEntries.filter((entry) => {', app.indexOf('function renderFinancialEntries('));
  const end = app.indexOf('\n  const eligibleIds', start);
  const entries = [
    {id: 'income', entry_type: 'income', account_id: 'bank-a', category_id: 'sale', status: 'paid'},
    {id: 'expense', entry_type: 'expense', account_id: 'bank-b', category_id: 'cost', status: 'pending'},
    {id: 'cancelled', entry_type: 'income', account_id: 'bank-a', category_id: 'sale', status: 'cancelled'},
    {id: 'cash', entry_type: 'income', account_id: 'cash', category_id: 'sale', status: 'paid'},
  ];
  const filters = {type: 'income|expense', accountId: 'bank-a|bank-b', categoryId: 'sale|cost', status: 'paid|pending'};
  const result = runInNewContext(`${helpers}\n${app.slice(start, end)}\nentries.map(entry => entry.id)`, {
    ...context, state: {financialEntries: entries}, view: 'financeTransactions', filterType: null,
    filters, bankAccountIds, budgetFilter: null, financialEntryDate: () => '2026-10-15', hasGlobalFilter: true,
  });
  assert.deepEqual(Array.from(result), ['income', 'expense']);
  assert.equal(api.financialFilterMatches('anything', ''), true);
});

test('checkboxes add and remove choices and All clears the field', () => {
  let handler;
  const state = {financialEntryFilters: {accountId: '__bank_accounts__'}};
  const start = app.indexOf('document.querySelector("#financialEntryFilters")?.addEventListener("input"');
  const end = app.indexOf('\ndocument.querySelector("#clearFinancialEntryFilters")', start);
  runInNewContext(`${helpers}\n${app.slice(start, end)}`, {
    ...context, state, document: {querySelector: () => ({addEventListener: (_, fn) => {handler = fn;}})}, renderFinancialEntries() {},
  });
  const choose = (value, checked) => handler({target: {dataset: {financialMultiFilter: 'financialEntryFilterAccount'}, value, checked}});
  choose('cash', true);
  assert.equal(state.financialEntryFilters.accountId, '__bank_accounts__|cash');
  choose('__bank_accounts__', false);
  assert.equal(state.financialEntryFilters.accountId, 'cash');
  choose('', true);
  assert.equal(state.financialEntryFilters.accountId, '');
});
