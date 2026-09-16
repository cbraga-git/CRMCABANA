import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function formatFinancialDescription(value) {");
const end = app.indexOf("\n}\n", start) + 2;
assert.ok(start >= 0 && end > start);
const formatFinancialDescription = runInNewContext(`${app.slice(start, end)}\nformatFinancialDescription`);

test("descrições financeiras usam Title Case com acentos, números e pontuação", () => {
  assert.equal(formatFinancialDescription("PAGAMENTO FORNECEDOR ABC"), "Pagamento Fornecedor Abc");
  assert.equal(formatFinancialDescription("  transferência de 02 contas  "), "Transferência De 02 Contas");
  assert.equal(formatFinancialDescription("COMPRA D'ÁGUA - PIX"), "Compra D'Água - Pix");
});
