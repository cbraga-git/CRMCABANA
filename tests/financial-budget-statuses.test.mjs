import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");

function extract(start, end) {
  const from = app.indexOf(start);
  const to = app.indexOf(end, from);
  assert.ok(from >= 0 && to > from);
  return app.slice(from, to);
}

const nextFinancialStatuses = runInNewContext(
  `${extract("function nextFinancialStatuses(", "\nfunction setStatusFilter(")}\nnextFinancialStatuses`
);

test("Shift+clique combina e remove status sem alterar o clique comum", () => {
  let selected = nextFinancialStatuses(["Todos"], "Aprovado", true);
  selected = nextFinancialStatuses(selected, "Novo", true);
  assert.deepEqual(Array.from(selected), ["Aprovado", "Novo"]);
  selected = nextFinancialStatuses(selected, "Aprovado", true);
  assert.deepEqual(Array.from(selected), ["Novo"]);
  selected = nextFinancialStatuses(selected, "Novo", true);
  assert.deepEqual(Array.from(selected), ["Todos"]);
  assert.deepEqual(Array.from(nextFinancialStatuses(["Novo", "Aprovado"], "Recusado", false)), ["Recusado"]);
  assert.deepEqual(Array.from(nextFinancialStatuses(["Novo"], "Todos", true)), ["Todos"]);
});

test("demonstrativo soma apenas os orçamentos dos status combinados", () => {
  const state = {
    view: "financial",
    financialStatuses: ["Aprovado", "Recusado"],
    budgetStatus: "Todos",
    budgetSearch: "",
    budgetStartDate: "",
    budgetEndDate: "",
    clients: [{ id: "client-1", name: "Cliente", status: "Ativo", budgets: [
      { code: "1", status: "Novo" },
      { code: "2", status: "Aprovado" },
      { code: "3", status: "Recusado" },
      { code: "4", status: "Finalizado" },
    ] }],
  };
  const filteredBudgets = runInNewContext(
    `${extract("function filteredBudgets() {", "\nfunction renderBudgetClientOptions(")}\nfilteredBudgets`,
    {
      state,
      clientBudgetHistory: (client) => client.budgets,
      responsibleSeller: () => "",
      budgetDateValue: () => "2026-09-16",
      dateInRange: () => true,
      sortBudgets: (budgets) => budgets,
      ORDER_STATUS: [],
    }
  );
  assert.deepEqual(Array.from(filteredBudgets(), ({ budget }) => budget.status), ["Aprovado", "Recusado"]);
  state.financialStatuses = ["Todos"];
  assert.deepEqual(Array.from(filteredBudgets(), ({ budget }) => budget.status), ["Novo", "Aprovado"]);
});
