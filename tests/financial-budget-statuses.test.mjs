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

const nextSelectedStatuses = runInNewContext(
  `${extract("function nextSelectedStatuses(", "\nfunction setStatusFilter(")}\nnextSelectedStatuses`
);

test("Shift+clique combina e remove status sem alterar o clique comum", () => {
  let selected = nextSelectedStatuses(["Todos"], "Aprovado", true);
  selected = nextSelectedStatuses(selected, "Novo", true);
  assert.deepEqual(Array.from(selected), ["Aprovado", "Novo"]);
  selected = nextSelectedStatuses(selected, "Aprovado", true);
  assert.deepEqual(Array.from(selected), ["Novo"]);
  selected = nextSelectedStatuses(selected, "Novo", true);
  assert.deepEqual(Array.from(selected), ["Todos"]);
  assert.deepEqual(Array.from(nextSelectedStatuses(["Novo", "Aprovado"], "Recusado", false)), ["Recusado"]);
  assert.deepEqual(Array.from(nextSelectedStatuses(["Novo"], "Todos", true)), ["Todos"]);
});

test("seleção múltipla de orçamentos não altera pedidos nem resultados", () => {
  const state = {
    view: "budget",
    budgetStatus: "Todos",
    budgetSelectedStatuses: ["Todos"],
    financialStatuses: ["Aprovado"],
  };
  const setStatusFilter = runInNewContext(
    `${extract("function nextSelectedStatuses(", "\nfunction parseSortableDate(")}\nsetStatusFilter`,
    { state, render: () => {} }
  );
  setStatusFilter("budget", "Novo", true);
  setStatusFilter("budget", "Recusado", true);
  assert.deepEqual(Array.from(state.budgetSelectedStatuses), ["Novo", "Recusado"]);
  assert.deepEqual(Array.from(state.financialStatuses), ["Aprovado"]);
  assert.equal(state.budgetStatus, "Todos");
  state.view = "order";
  setStatusFilter("budget", "Aprovado", false);
  assert.equal(state.budgetStatus, "Aprovado");
  assert.deepEqual(Array.from(state.budgetSelectedStatuses), ["Novo", "Recusado"]);
});

test("demonstrativo soma apenas os orçamentos dos status combinados", () => {
  const state = {
    view: "financial",
    financialStatuses: ["Aprovado", "Recusado"],
    budgetSelectedStatuses: ["Todos"],
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

  state.view = "budget";
  state.budgetSelectedStatuses = ["Novo", "Recusado"];
  assert.deepEqual(Array.from(filteredBudgets(), ({ budget }) => budget.status), ["Novo", "Recusado"]);
  state.budgetSelectedStatuses = ["Todos"];
  assert.deepEqual(Array.from(filteredBudgets(), ({ budget }) => budget.status), ["Novo", "Aprovado"]);

  state.view = "order";
  state.budgetStatus = "Aprovado";
  assert.deepEqual(Array.from(filteredBudgets(), ({ budget }) => budget.status), ["Aprovado"]);
});
