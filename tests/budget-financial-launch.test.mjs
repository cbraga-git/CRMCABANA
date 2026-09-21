import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const start = app.indexOf("const BUDGET_FINANCIAL_EXPENSES = [");
const end = app.indexOf("\nasync function budgetFinancialEntryIds", start);
assert.ok(start >= 0 && end > start);
const statusStart = app.indexOf("function budgetFinancialStatusAllowed(status) {");
const statusEnd = app.indexOf("\nfunction updateBudgetFinancialButton", statusStart);
assert.ok(statusStart >= 0 && statusEnd > statusStart);

const categories = [
  { id: "operation", name: "Operação", parent_id: null, category_type: "both", active: true },
  ...[
    ["Fabrica", "expense"], ["Insumos", "expense"], ["Montagem", "expense"],
    ["Comissão Lela", "expense"], ["Comissão Iris", "expense"], ["Impostos", "expense"],
    ["Receita Venda de Planejados", "income"],
  ].map(([name, category_type], index) => ({ id: `category-${index}`, name, parent_id: "operation", category_type, active: true })),
];

function planFor(rows, payments, net = payments.reduce((sum, payment) => sum + Number(payment.value || 0), 0), contact = "") {
  const context = {
    calculateBudgetRows: (value) => value,
    budgetTotals: () => ({ net }),
    normalizedMigrationText: (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    normalizeFinancialTag: (value) => String(value).trim().toLowerCase().slice(0, 60),
    formatFinancialDescription: (value) => value,
    notesWithFinancialTags: (_, tags) => tags.join("|"),
    parseMoney: Number,
    BRL: { format: (value) => `R$ ${value.toFixed(2)}` },
  };
  const { budgetFinancialPlan, budgetFinancialDueDate, budgetFinancialMonthEnd, budgetFinancialStatusAllowed } = runInNewContext(
    `${app.slice(statusStart, statusEnd)}\n${app.slice(start, end)}\n({ budgetFinancialPlan, budgetFinancialDueDate, budgetFinancialMonthEnd, budgetFinancialStatusAllowed })`, context,
  );
  const budget = { id: "budget-1", code: "123", nobiliaId: "N-8", nobiliaDate: "2026-09-10", createdAt: "2026-09-01T12:00:00Z", rows, settings: {}, cashPayments: payments };
  const client = { id: "client-1", name: "Maria de Oliveira", contact };
  return { plan: () => budgetFinancialPlan(budget, client, "2026-09-21", { id: "mercado" }, categories), budgetFinancialDueDate, budgetFinancialMonthEnd, budgetFinancialStatusAllowed };
}

test("lancamento usa totais, categorias, tags e vencimentos corretos", () => {
  assert.match(html, /id="budgetLaunchFinancialBtn"[^>]*>Lançar Financeiro/);
  assert.match(html, /class="budget-tax-actions"[\s\S]*?id="budgetTaxRate"[\s\S]*?id="budgetLaunchFinancialBtn"/);
  assert.equal(html.indexOf('id="budgetLaunchFinancialBtn"') > html.indexOf('id="budgetTaxRate"'), true);
  const { plan, budgetFinancialDueDate } = planFor([
    { factoryFreight: 100, hardware: 30, release: 20, assembly: 40, lela: 10, iris: 5, tax: 12 },
    { factoryFreight: 25, hardware: 0, release: 0, assembly: 10, lela: 2, iris: 1, tax: 3 },
  ], [{ parcel: "1", value: "100", dueDate: "2026-09-25" }, { parcel: "2", value: "150", dueDate: "2026-10-25" }, { parcel: "3", value: "0", dueDate: "2026-12-10" }], undefined, "Priscila Almeida");
  const items = plan();
  assert.equal(items.length, 10);
  assert.equal(items.find((item) => item.key === "factoryFreight").amount, 125);
  assert.equal(items.find((item) => item.key === "assembly").amount, 50);
  assert.equal(items.find((item) => item.key === "factoryFreight").due_date, "2026-09-26");
  assert.equal(items.find((item) => item.key === "hardware").due_date, "2026-10-31");
  assert.equal(items.find((item) => item.key === "lela").due_date, "2026-10-31");
  assert.equal(items.find((item) => item.key === "iris").due_date, "2026-10-31");
  assert.equal(items.find((item) => item.key === "tax").due_date, "2026-12-21");
  assert.equal(budgetFinancialDueDate("2026-12-01", { taxDue: true }), "2027-02-21");
  assert.equal(items.find((item) => item.key === "income-1").due_date, "2026-09-25");
  assert.equal(items.find((item) => item.key === "income-2").amount, 150);
  assert.equal(items.find((item) => item.key === "income-3").amount, 0);
  assert.equal(items.filter((item) => item.entry_type === "income").reduce((sum, item) => sum + item.amount, 0), 250);
  assert.equal(items.find((item) => item.key === "factoryFreight").category_id, "category-0");
  assert.equal(items.find((item) => item.key === "hardware").category_id, "category-1");
  assert.equal(items.find((item) => item.key === "release").category_id, "operation");
  assert.equal(items.find((item) => item.key === "income-1").category_id, "category-6");
  assert.equal(items[0].issue_date, "2026-09-10");
  assert.equal(items[0].competence_date, "2026-09-21");
  assert.equal(items[0].account_id, "mercado");
  assert.equal(items[0].status, "pending");
  assert.match(items[0].notes, /123 n-8/);
  assert.match(items[0].notes, /maria de oliveira/);
  assert.match(items[0].notes, /priscila almeida/);
});

test("contato vazio nao gera tag adicional", () => {
  const { plan } = planFor([], [{ value: "0", dueDate: "" }], 0, "   ");
  assert.equal(plan()[0].notes.split("|").length, 2);
});

test("Lela e Iris seguem a ultima parcela positiva, mesmo fora de ordem", () => {
  const { plan, budgetFinancialMonthEnd } = planFor([{ lela: 10, iris: 10 }], [
    { value: "100", dueDate: "2027-02-05" }, { value: "50", dueDate: "2027-01-20" },
  ]);
  assert.equal(plan().find((item) => item.key === "lela").due_date, "2027-02-28");
  assert.equal(plan().find((item) => item.key === "iris").due_date, "2027-02-28");
  assert.equal(budgetFinancialMonthEnd("2028-02-02"), "2028-02-29");
});

test("nao lanca status excluidos nem receitas divergentes do liquido", () => {
  const { plan, budgetFinancialStatusAllowed } = planFor([], [{ value: "100", dueDate: "2026-09-25" }], 101);
  assert.equal(budgetFinancialStatusAllowed("Novo"), false);
  assert.equal(budgetFinancialStatusAllowed("Recusado"), false);
  assert.equal(budgetFinancialStatusAllowed("Finalizado"), false);
  assert.equal(budgetFinancialStatusAllowed("Pedido"), true);
  assert.throws(plan, /deve somar o líquido/);
  assert.match(app, /financialLaunchedAt: options\.launchFinancial[\s\S]*?if \(budgetPayload\.financialLaunchedAt\) financialResult = await syncBudgetFinancialEntries/);
});

test("sincronizacao preserva pagos, atualiza pendentes, exclui zeros e nao duplica", async () => {
  const syncStart = app.indexOf("async function syncBudgetFinancialEntries(budget, client, createIfMissing = false) {");
  const syncEnd = app.indexOf("\nasync function saveBudget(options = {})", syncStart);
  assert.ok(syncStart >= 0 && syncEnd > syncStart);
  const writes = [];
  const existing = [
    { id: "paid-id", amount: 100, status: "paid", notes: "pago" },
    { id: "pending-id", amount: 50, status: "pending", notes: "anterior", category_id: "old", description: "Ferragens" },
    { id: "zero-id", amount: 10, status: "pending", notes: "anterior" },
    { id: "lela-id", amount: 20, status: "pending", notes: "anterior", category_id: "lela", description: "Lela", due_date: "2026-10-31" },
    { id: "iris-id", amount: 20, status: "pending", notes: "anterior", category_id: "iris", description: "Iris", due_date: "2026-11-30" },
  ];
  const plan = [
    { key: "factoryFreight", amount: 120, category_id: "factory", description: "Fábrica + Frete" },
    { key: "hardware", amount: 60, category_id: "hardware", description: "Ferragens", notes: "contact-tag" },
    { key: "tax", amount: 0, category_id: null, description: "Impostos" },
    { key: "income-1", amount: 250, category_id: "income", description: "Pagamento à Vista" },
    { key: "lela", amount: 20, category_id: "lela", description: "Lela", due_date: "2026-11-30", notes: "contact-tag" },
    { key: "iris", amount: 20, category_id: "iris", description: "Iris", due_date: "2026-11-30", notes: "contact-tag" },
  ];
  const context = {
    remoteDatabaseEnabled: () => true, currentUserId: () => "user",
    budgetFinancialEntryIds: async () => [["factoryFreight", "paid-id"], ["hardware", "pending-id"], ["tax", "zero-id"], ["income-1", "new-id"], ["lela", "lela-id"], ["iris", "iris-id"]],
    fetchBudgetFinancialEntries: async () => existing,
    budgetFinancialStatusAllowed: () => true,
    loadFinancialRegisters: async () => {},
    state: { financialAccounts: [{ id: "mercado", active: true, account_type: "bank", name: "Mercado Pago" }], financialCategories: [] },
    normalizedMigrationText: (value) => String(value).toLowerCase(),
    budgetFinancialLocalDate: () => "2026-09-21",
    budgetFinancialPlan: () => plan,
    budgetFinancialCents: (value) => Math.round(Number(value) * 100),
    financialEntryNotes: (entry) => entry.notes,
    financialEntryTags: (entry) => entry.notes === "contact-tag" ? ["contact-tag"] : ["tag"],
    notesWithFinancialTags: (notes, tags) => `${notes}|${Array.from(new Set(tags)).join(",")}`,
    BRL: { format: (value) => `R$ ${value}` },
    supabaseTableEndpoint: (_, query) => query,
    supabaseHeaders: () => ({}),
    authorizedFetch: async (url, request) => { writes.push({ method: request().method, id: url }); return { ok: true }; },
    saveFinancialRecord: async (_, id, payload) => { writes.push({ method: "PATCH", id, payload }); },
    postFinancialRows: async (_, rows) => { writes.push({ method: "POST", id: rows[0].id, payload: rows[0] }); },
  };
  const sync = runInNewContext(`${app.slice(syncStart, syncEnd)}\nsyncBudgetFinancialEntries`, context);
  const result = await sync({ id: "budget", code: "123", status: "Pedido" }, { id: "client" }, true);
  assert.equal(result.paid, 1);
  assert.equal(result.updated, 3);
  assert.equal(result.deleted, 1);
  assert.equal(result.created, 1);
  assert.equal(writes.some((write) => write.id === "paid-id"), false);
  assert.equal(writes.find((write) => write.id === "pending-id").payload.amount, 60);
  assert.match(writes.find((write) => write.id === "pending-id").payload.notes, /Valor atualizado/);
  assert.match(writes.find((write) => write.id === "pending-id").payload.notes, /contact-tag/);
  assert.equal(writes.find((write) => write.id === "lela-id").payload.due_date, "2026-11-30");
  assert.match(writes.find((write) => write.id === "lela-id").payload.notes, /contact-tag/);
  assert.match(writes.find((write) => write.id === "iris-id").payload.notes, /contact-tag/);
  assert.equal(writes.find((write) => write.id.includes("zero-id")).method, "DELETE");
  assert.equal(writes.find((write) => write.id === "new-id").method, "POST");
});
