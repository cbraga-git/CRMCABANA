import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function budgetEnvironmentHasSpecialPricing(");
const end = app.indexOf("\nfunction normalizeBudgetSettings(", start);
const state = { environmentTypes: { VIDRO: "cost", COZINHA: "factory" } };
const { calculateBudgetRows: calculate, budgetEnvironmentHasSpecialPricing: special } = runInNewContext(`${app.slice(start, end)}\n({ calculateBudgetRows, budgetEnvironmentHasSpecialPricing })`, {
  state, percentToRate: (value) => Number(value || 0) / 100, parseMoney: (value) => Number(value || 0),
  normalizedMigrationText: (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
});
const settings = { discountRate: 10, assemblyRate: 10, taxRate: 12, releaseRate: 5, lelaRate: 2, irisRate: 2, freightValue: 100, freightMode: "value" };
test("LED e Ferragens são custo e os demais são fábrica por padrão", () => {
  for (const name of ["LED", "LEDS", "Ferragens"]) assert.equal(special(name, "factory"), true);
  assert.equal(special("Quarto"), false);
  assert.equal(special("Vidro"), true);
});
test("novo custo fica fora da fábrica e do frete e reduz o lucro", () => {
  const rows = calculate([{ name: "Cozinha", gross: 1000, factory: 400 }, { name: "Vidro", gross: 500, factory: 150, assembly: 20 }], settings);
  assert.equal(rows[0].factoryFreight, 500);
  assert.equal(rows[1].factoryFreight, 0);
  assert.equal(rows[1].gross, 0);
  assert.equal(rows[1].net, 0);
  assert.equal(rows[1].freight, 0);
  assert.equal(rows[1].tax, 0);
  assert.equal(rows[1].release, 0);
  assert.equal(rows[1].assembly, 20);
  assert.equal(rows[1].environmentCost, 150);
  assert.equal(rows[1].profit, -170);
});
test("classificação salva no orçamento funciona sem cadastro local", () => {
  const [row] = calculate([{ name: "Espelho", environmentType: "cost", factory: 80 }], settings);
  assert.equal(row.environmentType, "cost");
  assert.equal(row.factoryFreight, 0);
  assert.equal(row.environmentCost, 80);
});
test("novo ambiente fábrica participa do rateio normalmente", () => {
  const rows = calculate([{ name: "Quarto", factory: 200, gross: 1000 }, { name: "Sala", factory: 300, gross: 1000 }], settings);
  assert.equal(rows[0].factoryFreight, 240);
  assert.equal(rows[1].factoryFreight, 360);
  assert.equal(rows[0].environmentCost, 0);
});
