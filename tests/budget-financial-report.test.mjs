import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
for (const app of ["crmcabana", "gestaocabana"]) {
  const source = await readFile(new URL(`../${app}/app.js`, import.meta.url), "utf8");
  const start = source.indexOf("function budgetFinancialReportHtml(");
  const end = source.indexOf("async function openBudgetFinancialReport(", start);
  const render = runInNewContext(`${source.slice(start, end)};budgetFinancialReportHtml`, {
    BRL: { format: (value) => `R$ ${value}` },
    escapeHtml: (value) => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
    formatFinancialDate: (value) => value || "",
  });
  test(`${app}: report separates simulation, paid, pending and cancelled with escaped data`, () => {
    const html = render({ code: "A1" }, { name: "<script>" }, [
      { entry_type: "income", status: "paid", amount: 100, description: "Venda" },
      { entry_type: "expense", status: "pending", amount: 20, description: "Simulado - Custo" },
      { entry_type: "income", status: "cancelled", amount: 999, description: "Cancelado" },
      { entry_type: "transfer", status: "paid", amount: 500, description: "Transferencia" },
    ], [], []);
    assert.ok(html.includes("Saldo realizado: <strong>R$ 100</strong>"));
    assert.ok(html.includes("Saldo pendente: <strong>R$ -20</strong>"));
    assert.ok(html.includes("Saldo previsto: <strong>R$ 80</strong>"));
    assert.ok(html.includes("Definitivo (previsto): <strong>R$ 100</strong>"));
    assert.ok(html.includes("Simulado (previsto): <strong>R$ -20</strong>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes("<script>"));
    assert.ok(render({}, {}, [], [], []).includes("Nenhum lançamento vinculado"));
  });
}
