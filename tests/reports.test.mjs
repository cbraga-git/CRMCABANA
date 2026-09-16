import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const code = app.slice(app.indexOf("const REPORT_COLUMNS ="), app.indexOf("async function createBackupArchive("));

function reportApi() {
  const context = {
    financialEntryDate: (entry) => entry.due_date || entry.competence_date || entry.issue_date || "",
    financialEntryTags: (entry) => entry.tags || [],
    financialEntryNotes: (entry) => entry.notes || "",
    normalizeLeadStatus: (status) => status,
    normalizeClientActive: (active) => active,
    responsibleSeller: (client) => client.owner || "",
    clientBudgetHistory: (client) => client.budgets || [],
    budgetSummary: (budget) => budget.totals,
    formatBudgetCodeForList: (code) => code,
    parseSortableDate: (value) => Date.parse(value) || 0,
  };
  vm.runInNewContext(`${code}\nglobalThis.reportApi = { reportDateKey, reportClientRows, reportBudgetRows, reportTransactionRows, REPORT_COLUMNS, REPORT_NUMERIC_COLUMNS };`, context);
  return context.reportApi;
}

test("relatorio de clientes combina data, cliente, status e busca", () => {
  const { reportDateKey, reportClientRows } = reportApi();
  assert.equal(reportDateKey("16/09/2026 11:30"), "2026-09-16");
  const clients = [
    { id: "1", name: "Ana Lima", status: "Ativo", createdAt: "2026-09-16", email: "ana@teste.com", address: {} },
    { id: "2", name: "Ana Souza", status: "Ativo", createdAt: "2026-08-01", address: {} },
    { id: "3", name: "Bruno", status: "Inativo", createdAt: "2026-09-16", address: {} },
  ];
  const rows = reportClientRows(clients, { clientId: "1", status: "Ativo", startDate: "2026-09-01", endDate: "2026-09-30", search: "ana" });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Cliente, "Ana Lima");
  assert.equal(rows[0].Cadastro, "2026-09-16");
});

test("relatorio de orcamentos usa historico, data selecionada e valores numericos", () => {
  const { reportBudgetRows, REPORT_NUMERIC_COLUMNS } = reportApi();
  const clients = [{ id: "1", name: "Ana", owner: "Maria", budgets: [
    { code: "A", status: "Aprovado", createdAt: "2026-08-01", saleAt: "2026-09-16", rows: [{ name: "Cozinha" }], totals: { gross: 1000, factoryFreight: 500, cost: 600, net: 800, profit: 200, margin: 0.25 } },
    { code: "B", status: "Novo", createdAt: "2026-09-16", saleAt: "", rows: [], totals: { gross: 500, factoryFreight: 200, cost: 300, net: 400, profit: 100, margin: 0.25 } },
  ] }];
  const rows = reportBudgetRows(clients, { clientId: "1", status: "Aprovado", dateField: "sale", startDate: "2026-09-01", endDate: "2026-09-30", search: "ana" });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]["Código"], "A");
  assert.equal(rows[0]["Margem (%)"], 25);
  assert.equal(rows[0]["Lucro (R$)"], 200);
  assert.ok(REPORT_NUMERIC_COLUMNS.budgets.includes("Lucro (R$)"));
});

test("extrato financeiro filtra e calcula transferencias pela conta escolhida", () => {
  const { reportTransactionRows } = reportApi();
  const entries = [
    { id: "1", entry_type: "income", status: "paid", account_id: "A", amount: 100, description: "Venda", issue_date: "2026-09-14" },
    { id: "2", entry_type: "transfer", status: "paid", account_id: "A", transfer_account_id: "B", amount: 40, description: "Transferência", issue_date: "2026-09-15" },
    { id: "3", entry_type: "expense", status: "cancelled", account_id: "B", amount: 10, description: "Cancelada", issue_date: "2026-09-16" },
  ];
  const accounts = [{ id: "A", name: "Mercado Pago" }, { id: "B", name: "Itaú" }];
  const filters = { dateField: "issue", startDate: "2026-09-01", endDate: "2026-09-30", accountId: "B", clientId: "", status: "", type: "", search: "" };
  const rows = reportTransactionRows(entries, accounts, [], [], filters);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]["Entrada (R$)"], 40);
  assert.equal(rows[0]["Acumulado filtrado (R$)"], 40);
  assert.equal(rows[1]["Movimento (R$)"], 0);
  assert.equal(rows[1]["Acumulado filtrado (R$)"], 40);
  const all = reportTransactionRows(entries, accounts, [], [], { ...filters, accountId: "" });
  assert.equal(all[1]["Movimento (R$)"], 0);
  assert.equal(all[1]["Acumulado filtrado (R$)"], 100);
});
