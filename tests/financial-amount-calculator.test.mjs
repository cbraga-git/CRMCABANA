import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const start = app.indexOf("function calculateFinancialEntryAmount(expression) {");
const end = app.indexOf("\nfunction resolveFinancialEntryAmount", start);
assert.ok(start >= 0 && end > start);
const calculate = runInNewContext(`${app.slice(start, end)}\ncalculateFinancialEntryAmount`);
const resolverEnd = app.indexOf("\nfunction openFinancialEntryDialog", end);
assert.ok(resolverEnd > end);

test("campo de valor permite as quatro operacoes e respeita a precedencia", () => {
  assert.match(html, /id="financialEntryAmount" type="text"/);
  assert.equal(calculate("100 + 25 * 2"), 150);
  assert.equal(calculate("(100 + 25) * 2"), 250);
  assert.equal(calculate("100 - 25 / 2"), 87.5);
  assert.equal(calculate("500 / 2"), 250);
  assert.equal(calculate("3 × 4 + 8 ÷ 2"), 16);
});

test("valores brasileiros sao lidos e arredondados para centavos", () => {
  assert.equal(calculate("1.000,50 + 2,25"), 1002.75);
  assert.equal(calculate("1000.50 + 2.25"), 1002.75);
  assert.equal(calculate("10 / 3"), 3.33);
  assert.equal(calculate("1.000"), 1000);
});

test("expressoes invalidas e valores nao positivos nao sao aceitos", () => {
  for (const value of ["", "0", "5 - 5", "2 - 8", "1 / 0", "1 +", "(2 + 3", "2 ** 3", "abc", "1,2,3"]) {
    assert.equal(calculate(value), null, value);
  }
});

test("resultado e formatado antes de salvar e erros impedem o envio", () => {
  const field = { value: "100 + 50 / 2", message: "", setCustomValidity(message) { this.message = message; }, reportValidity() { this.reported = true; } };
  const document = { querySelector: () => field };
  const resolve = runInNewContext(`${app.slice(start, resolverEnd)}\nresolveFinancialEntryAmount`, { document });
  assert.equal(resolve(), 125);
  assert.equal(field.value, "125.00");
  field.value = "1 / 0";
  assert.equal(resolve(true), null);
  assert.ok(field.message);
  assert.equal(field.reported, true);
  assert.match(app, /const amount = resolveFinancialEntryAmount\(true\);\s*if \(amount === null\) return;/);
});
