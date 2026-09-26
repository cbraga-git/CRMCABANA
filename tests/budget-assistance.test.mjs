import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../crmcabana/styles.css", import.meta.url), "utf8");
const start = app.indexOf("function normalizeBudgetAssistances(");
const end = app.indexOf("\nfunction updateBudgetAssistanceButton(", start);
assert.ok(start >= 0 && end > start);
const normalize = runInNewContext(`${app.slice(start, end)}\nnormalizeBudgetAssistances`, { parseMoney: Number });

test("orçamento preserva múltiplas assistências válidas", () => {
  const items = Array.from(normalize([
    { id: "1", assemblerName: " Ana ", description: " Ajuste da fita ", amount: "120", createdAt: "2026-09-26" },
    { id: "2", assemblerName: "João", description: "Troca da fonte", amount: 80 },
    { id: "3", description: "Sem valor", amount: 0 },
  ]));
  assert.equal(items.length, 2);
  assert.deepEqual({ ...items[0] }, { id: "1", assemblerName: "Ana", description: "Ajuste da fita", amount: 120, createdAt: "2026-09-26" });
});

test("botão e formulário de assistência seguem o status Finalizado", () => {
  assert.match(html, /id="budgetAssistanceBtn"[^>]*aria-disabled="true"/);
  assert.match(html, /id="budgetAssistanceDialog"[\s\S]*?id="budgetAssistanceAssembler"[\s\S]*?id="budgetAssistanceAmount"[\s\S]*?id="budgetAssistanceDescription"/);
  assert.match(app, /normalizedMigrationText\(budgetInputValue\("budgetStatus"\)\) === "finalizado"/);
  assert.match(app, /assistência somente pode ser registrada quando o orçamento estiver com o status Finalizado/);
  assert.match(app, /assistances: normalizeBudgetAssistances\(state\.budgetAssistanceDrafts\)/);
  assert.match(css, /\.budget-assembler-name\s*\{\s*grid-column: span 2;/);
});
