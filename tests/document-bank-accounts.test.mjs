import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function normalizeDocumentBankAccount(");
const source = app.slice(start, app.indexOf("\nfunction budgetPaymentRateFor(", start));
const headerStart = app.indexOf("function documentCompanyHeaderRows(");
const headerSource = app.slice(headerStart, app.indexOf("\nfunction documentWithRepeatingHeader(", headerStart));
const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
function harness(clients = []) {
  const nodes = new Map();
  const state = { clients };
  const saves = [];
  const context = { state, document: { querySelector: (key) => {
    if (!nodes.has(key)) nodes.set(key, { value: "", innerHTML: "", textContent: "" });
    return nodes.get(key);
  } }, escapeHtml, isAdmin: () => true, currentUserId: () => "admin", selectedBudgetClient: () => state.clients[0], createId: () => "new-bank",
  saveClients: async (ids) => { saves.push(ids); return true; }, markBudgetDirty() {} };
  const api = runInNewContext(`${source}\n${headerSource}\n({ documentBankAccounts, readDocumentBankAccount, writeDocumentBankAccount, registerDocumentBankAccount, documentCompanyHeaderRows })`, context);
  return { api, state, nodes, saves, context };
}
const bank = { id: "bank-2", label: "Cabana Santander", bank: "Santander", code: "033", agency: "1234", number: "98765-0", holder: "Cabana", document: "47.946.284/0001-77", pix: "financeiro@example.test" };

test("registered company accounts are shared across clients, with latest changes winning", () => {
  const h = harness([{ documentBankAccounts: [{ ...bank, updatedAt: "2026-10-01" }] }, { documentBankAccounts: [{ ...bank, agency: "4321", updatedAt: "2026-10-06" }] }]);
  assert.equal(h.api.documentBankAccounts().length, 2);
  assert.equal(h.api.documentBankAccounts()[1].agency, "4321");
});
test("registration persists only the selected client and preserves saved contract data", async () => {
  const original = { paymentPlan: { bankAccount: { ...bank } } };
  const h = harness([{ id: "client-1", budget: original }]);
  h.api.writeDocumentBankAccount({ ...bank, id: "", number: "123-4" });
  await h.api.registerDocumentBankAccount();
  assert.equal(h.saves.length, 1);
  assert.equal(h.saves[0][0], "client-1");
  assert.equal(h.state.clients[0].documentBankAccounts[0].number, "123-4");
  assert.equal(original.paymentPlan.bankAccount.number, "98765-0");
  assert.equal(h.api.readDocumentBankAccount().id, "new-bank");
});
test("invalid registration never writes incomplete account data", async () => {
  const h = harness([{ id: "client-1" }]);
  h.api.writeDocumentBankAccount({ ...bank, code: "3X1" });
  await h.api.registerDocumentBankAccount();
  assert.equal(h.saves.length, 0);
  assert.match(h.nodes.get("#budgetBankMessage").textContent, /três números/);
});
test("document header uses saved account even when payment plan is disabled", () => {
  const h = harness();
  const header = h.api.documentCompanyHeaderRows({ budget: { paymentPlan: { enabled: false, bankAccount: bank } } });
  for (const value of ["Santander - 033", "1234", "98765-0", "financeiro@example.test"]) assert.ok(header.includes(value));
  assert.ok(!header.includes("99307-5"));
});
test("legacy documents retain Itau 341 and custom bank values are escaped", () => {
  const h = harness();
  assert.match(h.api.documentCompanyHeaderRows({ budget: {} }), /Itau - 341/);
  const header = h.api.documentCompanyHeaderRows({ budget: { paymentPlan: { bankAccount: { ...bank, bank: '<script>bad</script>', pix: '<img src=x onerror=bad>' } } } });
  assert.ok(!header.includes("<script>"));
  assert.ok(!header.includes("<img src=x"));
  assert.match(header, /&lt;script>/);
});
