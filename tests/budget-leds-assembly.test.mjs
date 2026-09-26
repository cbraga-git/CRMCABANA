import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");

function extract(startMarker, endMarker) {
  const start = app.indexOf(startMarker);
  const end = app.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start);
  return app.slice(start, end);
}

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const calculate = runInNewContext(`${extract("function calculateBudgetRows(", "\nfunction normalizeBudgetSettings(")}\ncalculateBudgetRows`, {
  percentToRate: (value) => Number(value || 0) / 100,
  parseMoney: (value) => Number(value || 0),
  normalizedMigrationText: normalize,
});

const settings = { discountRate: 0, releaseRate: 0, assemblyRate: 10, lelaRate: 0, irisRate: 0, taxRate: 0, freightValue: 0, freightMode: "value" };

test("montagem usa percentual normalmente e valor livre para LEDS", () => {
  const rows = calculate([
    { name: "Cozinha", gross: 1000, factory: 0, hardware: 0 },
    { name: "LEDS", gross: 500, factory: 0, hardware: 0, assembly: 275 },
  ], settings);
  assert.equal(rows[0].assembly, 100);
  assert.equal(rows[1].assembly, 275);
  assert.equal(rows[1].totalCost, 275);
  assert.equal(rows[1].profit, 225);
});

test("LEDS nao recebe desconto nem frete e nao reduz o rateio dos demais ambientes", () => {
  const rows = calculate([
    { name: "Cozinha", gross: 1000, factory: 400, hardware: 0 },
    { name: "LEDS", gross: 500, factory: 100, hardware: 0, assembly: 50 },
  ], { ...settings, discountRate: 10, freightValue: 100, freightMode: "value" });
  assert.equal(rows[0].net, 900);
  assert.equal(rows[0].freight, 100);
  assert.equal(rows[1].net, 500);
  assert.equal(rows[1].freight, 0);
  assert.equal(rows[1].factoryFreight, 100);

  const percentRows = calculate([
    { name: "Cozinha", gross: 1000, factory: 400, hardware: 0 },
    { name: "LEDS", gross: 500, factory: 100, hardware: 0, assembly: 50 },
  ], { ...settings, discountRate: 10, freightValue: 10, freightMode: "percent" });
  assert.equal(percentRows[0].freight, 40);
  assert.equal(percentRows[1].freight, 0);
});

test("linha LEDS exige montagem manual positiva", () => {
  const alerts = [];
  const validate = runInNewContext(`${extract("function validateBudgetLedAssembly(", "\nasync function saveBudget(")}\nvalidateBudgetLedAssembly`, {
    normalizedMigrationText: normalize,
    parseMoney: (value) => Number(value || 0),
    alert: (message) => alerts.push(message),
    elements: { budgetRows: { querySelectorAll: () => [] } },
  });
  assert.equal(validate([{ name: "Cozinha", assembly: 0 }]), true);
  assert.equal(validate([{ name: "LEDS", assembly: 0 }]), false);
  assert.match(alerts[0], /Montagem.*LEDS/);
  assert.equal(validate([{ name: "leds", assembly: 120 }]), true);
});
