import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("function validateBudgetAssemblyDetails(");
const end = app.indexOf("\nasync function saveBudget(", start);
assert.ok(start >= 0 && end > start);

function createValidator() {
  const alerts = [];
  const focused = [];
  const validate = runInNewContext(`${app.slice(start, end)}\nvalidateBudgetAssemblyDetails`, {
    normalizedMigrationText: (value) => String(value || "").toLowerCase(),
    alert: (message) => alerts.push(message),
    document: { querySelector: (selector) => ({ focus: () => focused.push(selector) }) },
  });
  return { validate, alerts, focused };
}

const complete = {
  assemblerName: "Montador",
  assemblyBeneficiary: "Favorecido",
  assemblyPixKey: "pix@example.com",
  assemblyStartDate: "2026-10-01",
  assemblyEndDate: "2026-10-05",
};

test("status Novo permite salvar sem dados da montagem", () => {
  const { validate, alerts } = createValidator();
  assert.equal(validate("Novo", {}), true);
  assert.equal(alerts.length, 0);
});

test("status diferente de Novo exige todos os dados da montagem", () => {
  const { validate, alerts, focused } = createValidator();
  assert.equal(validate("Aprovado", { ...complete, assemblerName: "", assemblyPixKey: "" }), false);
  assert.match(alerts[0], /Nome do montador, Chave Pix/);
  assert.deepEqual(focused, ["#budgetAssemblerName"]);
});

test("status diferente de Novo aceita dados da montagem completos", () => {
  const { validate, alerts } = createValidator();
  assert.equal(validate("Negociação", complete), true);
  assert.equal(alerts.length, 0);
});
