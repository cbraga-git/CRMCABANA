import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));
const core = extract("const BUDGET_PAYMENT_RATE_MATRIX =", "\nfunction readBudgetPaymentPlan(");
const context = { BRL: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }) };
const { calculateBudgetPaymentPlan: calculate, budgetPaymentMonthDate: monthDate, normalizeBudgetPaymentPlan: normalize } = runInNewContext(`${core}\n({ calculateBudgetPaymentPlan, budgetPaymentMonthDate, normalizeBudgetPaymentPlan })`, context);
const defaults = { enabled: true, entry: 2000, months: 12, entryDate: "2026-09-26", firstDueDate: "2026-10-31", entryMethod: "PIX", method: "Boleto" };

test("matriz comercial aplica 2,2% para 12x com entrada de 20% e fecha centavos", () => {
  const result = calculate(10000, defaults);
  assert.equal(result.balance, 8000);
  assert.equal(result.effectiveRate, 2.2);
  assert.equal(result.total, 11189.59);
  assert.equal(result.payments.length, 13);
  assert.equal(result.payments.reduce((sum, row) => sum + Math.round(row.amount * 100), 0), 1118959);
  assert.equal(result.payments[0].method, "PIX");
  assert.equal(result.payments[1].method, "Boleto");
});

test("matriz escolhe a coluna pela maior faixa de entrada atingida", () => {
  assert.equal(calculate(10000, { ...defaults, months: 2 }).effectiveRate, 1.3);
  assert.equal(calculate(10000, { ...defaults, entry: 3000, months: 6 }).effectiveRate, 1.5);
  assert.equal(calculate(10000, { ...defaults, entry: 4000, months: 6 }).effectiveRate, 1.4);
  assert.equal(calculate(10000, { ...defaults, entry: 5000, months: 6 }).effectiveRate, 1.2);
});

test("taxa mensal informada manualmente substitui a sugestão da matriz", () => {
  const result = calculate(10000, { ...defaults, months: 12, rate: 1.25, rateAuto: false });
  assert.equal(result.effectiveRate, 1.25);
  assert.equal(result.installment, 722.07);
});

test("taxa personalizada usa o mesmo c?lculo da matriz e preserva planos salvos", () => {
  for (let months = 1; months <= 24; months++) {
    const automatic = calculate(10000, { ...defaults, months });
    const custom = calculate(10000, { ...defaults, months, rate: automatic.effectiveRate, rateAuto: false, rateCustom: true });
    assert.deepEqual(custom, automatic);
  }
  const saved = normalize({ ...defaults, rate: 1.2345, rateAuto: false, rateCustom: true });
  assert.equal(saved.rate, 1.2345);
  assert.equal(calculate(10000, saved).effectiveRate, 1.2345);
  assert.doesNotMatch(html, /budgetPaymentCustomRate/);
  assert.match(html, /value="custom">Taxa personalizada/);
});

test("taxa personalizada entra na lista e cancelamento preserva a sele??o", () => {
  const options = [{ value: "" }, { value: "2.2" }, { value: "custom" }];
  const rate = {
    options, value: "custom", dataset: { auto: "true", selectedRate: "2.2" },
    querySelector: () => options.at(-1),
    insertBefore: (option) => options.splice(options.length - 1, 0, option),
  };
  let answer = "1,2345";
  const alerts = [];
  const ui = runInNewContext(`${extract("function selectBudgetPaymentRate(", "\nfunction fillBudgetPaymentPlan(")}\n({ changeBudgetPaymentRate })`, {
    document: { createElement: () => ({ dataset: {} }) },
    prompt: () => answer, alert: (message) => alerts.push(message),
  });
  ui.changeBudgetPaymentRate(rate);
  assert.equal(rate.value, "1.2345");
  assert.equal(rate.dataset.auto, "false");
  assert.equal(options.filter((option) => option.value === "1.2345").length, 1);
  rate.value = "custom";
  answer = null;
  ui.changeBudgetPaymentRate(rate);
  assert.equal(rate.value, "1.2345");
  assert.equal(rate.dataset.auto, "false");
  rate.value = "custom";
  answer = "abc";
  ui.changeBudgetPaymentRate(rate);
  assert.equal(rate.value, "1.2345");
  assert.equal(alerts.length, 1);
  rate.value = "";
  ui.changeBudgetPaymentRate(rate);
  assert.equal(rate.dataset.auto, "true");
});

test("taxa sugerida escolhida manualmente pode ser usada em qualquer prazo", () => {
  const result = calculate(10000, { ...defaults, months: 3, rate: 3.3, rateAuto: false });
  assert.equal(result.effectiveRate, 3.3);
  assert.match(html, /id="budgetPaymentRate"/);
  assert.doesNotMatch(html, /budgetPaymentRateSuggestion/);
});

test("sem juros pode ser selecionado no padrão Cabana de duas parcelas", () => {
  const result = calculate(10000, { ...defaults, months: 2, rate: 0, rateAuto: false });
  assert.equal(result.effectiveRate, 0);
  assert.equal(result.installment, 4000);
  assert.match(html, /<option value="0">Sem juros<\/option>/);
});

test("uma parcela após a entrada aceita pagamento sem juros", () => {
  const result = calculate(10000, { ...defaults, months: 1, rate: 0, rateAuto: false });
  assert.equal(result.payments.length, 2);
  assert.equal(result.payments[1].amount, 8000);
});

test("parcelas sem juros preservam vencimentos editados", () => {
  const result = calculate(10000, { ...defaults, months: 2, rate: 0, rateAuto: false, dueDates: { "plan-income-1": "2026-11-15", "plan-income-2": "2027-01-10" } });
  assert.equal(result.payments[1].dueDate, "2026-11-15");
  assert.equal(result.payments[2].dueDate, "2027-01-10");
  assert.match(app, /data-budget-payment-due/);
});

test("Price em doze meses confere prestação e juros conhecidos", () => {
  const result = calculate(10000, defaults);
  assert.equal(result.installment, 765.80);
  assert.equal(result.total, 11189.59);
  assert.equal(result.interest, 1189.59);
});

test("todos os prazos comerciais de 1 a 24 fecham soma e mantêm parcelas positivas", () => {
  for (let months = 1; months <= 24; months++) {
    const result = calculate(131857.74, { ...defaults, entry: 41864, months });
    assert.equal(result.payments.reduce((sum, row) => sum + Math.round(row.amount * 100), 0), Math.round(result.total * 100));
    assert.ok(result.payments.every((row) => row.amount >= 0));
    assert.ok(result.interest >= 0);
  }
});

test("entrada integral não gera juros nem parcelas adicionais", () => {
  const result = calculate(2000, { ...defaults, entry: 2000, months: 24 });
  assert.equal(result.total, 2000);
  assert.equal(result.interest, 0);
  assert.equal(result.payments.length, 1);
});

test("vencimentos preservam dia original e ajustam fevereiro e meses curtos", () => {
  assert.equal(monthDate("2026-01-31", 1), "2026-02-28");
  assert.equal(monthDate("2026-01-31", 2), "2026-03-31");
  assert.equal(monthDate("2028-01-31", 1), "2028-02-29");
  assert.equal(monthDate("2026-12-31", 1), "2027-01-31");
  assert.equal(monthDate("2026-02-31", 0), "");
});

test("rejeita entrada excedente, negativa, prazos e taxas inválidos", () => {
  for (const change of [{ entry: -1 }, { entry: 10001 }, { entry: 1999 }, { months: 0 }, { months: 25 }, { months: 1.5 }]) assert.throws(() => calculate(10000, { ...defaults, ...change }));
  assert.equal(normalize().enabled, false);
});

function financialHarness() {
  const categories = [{ id: "operation", name: "Operação", active: true, category_type: "both" }, { id: "income", name: "Receita Venda de Planejados", parent_id: "operation", active: true, category_type: "income" }];
  const ctx = {
    ...context, calculateBudgetPaymentPlan: calculate,
    calculateBudgetRows: () => [], budgetTotals: () => ({ net: 10000 }),
    normalizedMigrationText: (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    normalizeFinancialTag: (value) => String(value || "").trim(),
    formatFinancialDescription: (value) => value,
    notesWithFinancialTags: (notes, tags) => `${notes}\n${tags.join("|")}`,
    parseMoney: Number,
    deterministicMigrationUuid: async (value) => value,
  };
  const functions = runInNewContext(`${extract("const BUDGET_FINANCIAL_EXPENSES =", "\nasync function fetchBudgetFinancialEntries(")}\n({ budgetFinancialPlan, budgetFinancialEntryIds })`, ctx);
  const budget = { id: "budget-1", code: "002-082026", createdAt: "2026-09-26", paymentPlan: { ...defaults, months: 24 }, cashPayments: [{ value: 999, dueDate: "2026-10-01" }] };
  return { ...functions, budget, categories };
}

test("financeiro usa entrada mais 24 parcelas e ignora quadro legado quando novo plano ativo", async () => {
  const h = financialHarness();
  const rows = h.budgetFinancialPlan(h.budget, { id: "client", name: "Cliente" }, "2026-09-26", { id: "account" }, h.categories);
  const incomes = rows.filter((row) => row.entry_type === "income");
  assert.equal(incomes.length, 25);
  assert.equal(incomes[0].amount, 2000);
  assert.match(incomes[0].notes, /Forma de pagamento: PIX/);
  assert.match(incomes[24].notes, /Forma de pagamento: Boleto/);
  assert.equal(incomes[24].due_date, "2028-09-30");
  const ids = new Map(await h.budgetFinancialEntryIds(h.budget));
  assert.ok(incomes.every((row) => ids.has(row.key)));
  assert.equal(new Set(ids.values()).size, ids.size);
  assert.equal(incomes.reduce((sum, row) => sum + Math.round(row.amount * 100), 0), Math.round(calculate(10000, h.budget.paymentPlan).total * 100));
});

test("financeiro exige vencimentos e simulação identifica as novas receitas", () => {
  const h = financialHarness();
  h.budget.paymentPlan.firstDueDate = "";
  assert.throws(() => h.budgetFinancialPlan(h.budget, { name: "Cliente" }, "2026-09-26", { id: "account" }, h.categories), /vencimento/);
  h.budget.paymentPlan.firstDueDate = defaults.firstDueDate;
  const rows = h.budgetFinancialPlan(h.budget, { name: "Cliente" }, "2026-09-26", { id: "account" }, h.categories, { simulated: true });
  assert.ok(rows.every((row) => row.description.startsWith("Simulado - ")));
  const incomes = rows.filter((row) => row.entry_type === "income");
  assert.equal(incomes[0].due_date, defaults.entryDate);
  assert.equal(incomes[1].due_date, defaults.firstDueDate);
});

test("documentos incluem todas as parcelas e novo quadro antecede quadro preservado", () => {
  const ctx = {
    ...context, calculateBudgetPaymentPlan: calculate, escapeHtml: String,
    formatPrintDate: (value) => value, formatPercent: runInNewContext(`${extract("function formatPercent(", "\nfunction budgetInputValue(")}\nformatPercent`),
    printField: (label, value) => `<div>${label}: ${value}</div>`,
  };
  const functions = runInNewContext(`${extract("function orderPaymentRows(", "\nconst ORDER_ITEMS_PER_PAGE")}\n${extract("function buildBudgetPaymentPlanDocument(", "\nfunction buildQuoteDocument(")}\n({ orderPaymentRows, buildBudgetPaymentPlanDocument })`, ctx);
  const input = { client: { name: "Cliente" }, budget: { code: "002-082026", paymentPlan: { ...defaults, months: 24 } }, totals: { net: 10000 } };
  assert.equal(functions.orderPaymentRows(input).length, 25);
  const printed = functions.buildBudgetPaymentPlanDocument(input);
  assert.match(printed, /24\/24/);
  assert.match(printed, /2028-09-30/);
  assert.match(printed, /Entrada/);
  input.budget.paymentPlan.months = 24;
  assert.match(functions.buildBudgetPaymentPlanDocument(input), /3,3% a.m./);
  assert.ok(html.indexOf('id="budgetPaymentPlanPanel"') < html.indexOf('id="cashPaymentRows"'));
});

test("sincronização substitui receitas antigas, atualiza vencimentos e não duplica", async () => {
  const stored = new Map([["old-id", { id: "old-id", status: "pending", amount: 500, notes: "" }]]);
  const plan = [{ key: "plan-income-1", amount: 1000, description: "Financiamento - Parcela 1/1", category_id: "income", due_date: "2026-10-31", notes: "Forma de pagamento: Boleto" }];
  const pairs = [["income-1", "old-id"], ["plan-income-1", "new-id"]];
  const ctx = {
    ...context, remoteDatabaseEnabled: () => true, currentUserId: () => "user",
    budgetFinancialEntryIds: async () => pairs,
    fetchBudgetFinancialEntries: async () => [...stored.values()],
    budgetFinancialStatusAllowed: () => true,
    loadFinancialRegisters: async () => {},
    state: { financialAccounts: [{ id: "account", name: "Mercado Pago", active: true, account_type: "bank" }], financialCategories: [] },
    normalizedMigrationText: (value) => value.toLowerCase(),
    budgetFinancialLocalDate: () => "2026-09-26",
    budgetFinancialPlan: () => plan,
    budgetFinancialCents: (value) => Math.round((Number(value) || 0) * 100),
    BUDGET_FINANCIAL_EXPENSES: [],
    financialEntryNotes: (entry) => entry.notes || "",
    financialEntryTags: () => [], notesWithFinancialTags: (notes) => notes,
    postFinancialRows: async (_, rows) => rows.forEach((row) => stored.set(row.id, { ...row, status: "pending" })),
    saveFinancialRecord: async (_, id, changes) => stored.set(id, { ...stored.get(id), ...changes }),
    supabaseTableEndpoint: (_, query) => query, supabaseHeaders: () => ({}),
    authorizedFetch: async (url) => { stored.delete(url.split("eq.")[1]); return { ok: true }; },
  };
  const sync = runInNewContext(`${extract("async function syncBudgetFinancialEntries(", "\nasync function deleteBudgetFinancialSimulation(")}\nsyncBudgetFinancialEntries`, ctx);
  const first = await sync({ id: "budget-1", status: "Pedido" }, {}, true);
  assert.equal(first.created, 1);
  assert.equal(first.deleted, 1);
  assert.equal(stored.has("old-id"), false);
  assert.equal(stored.size, 1);
  const second = await sync({ id: "budget-1", status: "Pedido" }, {}, true);
  assert.equal(second.created, 0);
  assert.equal(second.updated, 0);
  plan[0].due_date = "2026-11-30";
  plan[0].notes = "Forma de pagamento: PIX";
  await sync({ id: "budget-1", status: "Pedido" }, {}, true);
  assert.equal(stored.get("new-id").due_date, "2026-11-30");
  assert.equal(stored.get("new-id").notes, "Forma de pagamento: PIX");
  stored.set("old-id", { id: "old-id", status: "paid", amount: 500 });
  await assert.rejects(sync({ id: "budget-1", status: "Pedido" }, {}, true), /parcelas recebidas/);
  assert.equal(stored.get("old-id").amount, 500);
});

test("troca de modelo com receita recebida é bloqueada antes de salvar orçamento", async () => {
  const ctx = {
    budgetFinancialEntryIds: async () => [["income-1", "old"], ["plan-income-1", "new"]],
    fetchBudgetFinancialEntries: async (ids) => ids.includes("old") ? [{ id: "old", status: "paid" }] : [],
  };
  const validate = runInNewContext(`${extract("async function validateBudgetPaymentTransition(", "\nasync function reconcileBudgetFinancialStatus(")}\nvalidateBudgetPaymentTransition`, ctx);
  await assert.rejects(validate({ paymentPlan: { ...defaults } }, { financialLaunchedAt: "2026-09-26" }), /parcelas recebidas/);
  await validate({ paymentPlan: { ...defaults } }, {});
});
