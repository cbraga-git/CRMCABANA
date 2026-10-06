import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function printableDocumentStyles() {");
const end = app.indexOf("function openPrintableHtml(", start);
const ctx = {
  document: { baseURI: "https://example.test/crmcabana/" },
  BRL: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
  escapeHtml: (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"),
  printField: (label, value) => `<div>${label}: ${value}</div>`,
  formatPercent: (value) => `${value * 100}%`,
  responsibleSeller: () => "Vendedor",
  clientAddressLine: () => "Endereço",
  parseMoney: Number,
  CONTRACT_CLAUSES: Array.from({ length: 80 }, (_, index) => `${index + 1}. Cláusula longa do contrato para verificar conteúdo integral.`),
  calculateBudgetPaymentPlan: () => ({ net: 10000, balance: 8000, entry: 2000, total: 10000, interest: 0, effectiveRate: 0, payments: [{ parcel: "Entrada", amount: 2000, dueDate: "2026-10-02", method: "PIX" }] }),
};
const api = runInNewContext(`${app.slice(start, end)}\n({ buildOrderDocument, buildQuoteDocument, documentCompanyHeaderRows, printableDocumentStyles })`, ctx);
const input = {
  budget: { code: "007-092026", createdAt: "2026-09-01T12:00:00Z", paymentPlan: { enabled: true }, notes: "Observações" },
  client: { name: "Cliente" },
  rows: Array.from({ length: 17 }, (_, index) => ({ name: `Ambiente ${index}`, net: 500 })),
  settings: {}, totals: { net: 10000 },
};

test("todas as páginas de pedido, contrato e pagamento usam o cabeçalho da empresa", () => {
  const result = api.buildOrderDocument(input);
  const pages = result.body.split('<section class="print-page ').slice(1);
  assert.equal(pages.length, 5);
  for (const page of pages) {
    assert.match(page, /class="document-repeat-header"/);
    assert.match(page, /Cabana Moveis Sob Medida Ltda/);
    assert.match(page, /47\.946\.284\/0001-77/);
    assert.match(page, /007-092026/);
    assert.match(page, /assets\/cabana-logo\.png/);
    assert.match(page, /99307-5/);
  }
  assert.match(result.body, /80\. Cláusula longa/);
});

test("orçamento e anexo possuem cabeçalho repetível sem perder ambientes", () => {
  const result = api.buildQuoteDocument(input);
  const pages = result.body.split('<section class="print-page ').slice(1);
  assert.equal(pages.length, 2);
  for (const page of pages) assert.match(page, /<thead class="document-repeat-header">/);
  assert.match(result.body, /Ambiente 16/);
  assert.match(api.printableDocumentStyles(), /\.document-repeat-header\s*\{[^}]*display: table-header-group/);
  assert.match(api.printableDocumentStyles(), /overflow: visible/);
});

test("identificação do contrato é escapada no cabeçalho compartilhado", () => {
  const header = api.documentCompanyHeaderRows({ budget: { code: '<script>"' } });
  assert.doesNotMatch(header, /<script>/);
  assert.match(header, /&lt;script>/);
});

test("conta escolhida aparece em todas as páginas do pedido, contrato e orçamento", () => {
  const custom = { ...input, budget: { ...input.budget, paymentPlan: { ...input.budget.paymentPlan,
    bankAccount: { bank: "Santander", code: "033", agency: "1234", number: "98765-0", holder: "Cabana", pix: "financeiro@example.test" } } } };
  for (const build of [api.buildOrderDocument, api.buildQuoteDocument]) {
    for (const page of build(custom).body.split('<section class="print-page ').slice(1)) {
      assert.match(page, /Santander - 033/);
      assert.match(page, /98765-0/);
      assert.match(page, /financeiro@example.test/);
      assert.doesNotMatch(page, /99307-5/);
    }
  }
});
