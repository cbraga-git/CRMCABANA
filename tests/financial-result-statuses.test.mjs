import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

for (const app of ['crmcabana', 'gestaocabana']) {
  const source = await readFile(new URL(`../${app}/app.js`, import.meta.url), 'utf8');
  const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
  const allowedSource = extract('function financialResultStatusAllowed(', '\nfunction renderStatusFilters(');
  const statuses = ['Novo', 'Negocia\u00e7\u00e3o', 'Aprovado', 'Em produ\u00e7\u00e3o', 'Finalizado', 'Recusado'];
  test(`${app}: results exclude unqualified budgets from totals and chart data`, () => {
    const state = { view: 'financial', financialStatuses: ['Todos'], budgetSearch: '', budgetStartDate: '', budgetEndDate: '',
      clients: [{ name: 'Cliente', budgets: statuses.map((status, index) => ({ status, value: index + 1 })) }] };
    const totals = new Map(); let chart;
    const api = runInNewContext(`${allowedSource}\n${extract('function filteredBudgets()', '\nfunction renderBudgetClientOptions(')}\n${extract('function renderBudgetDashboard()', '\nfunction syncBudgetFilterInputs(')}\n({filteredBudgets, renderBudgetDashboard})`, {
      state, isAdmin: () => true, clientBudgetHistory: client => client.budgets, responsibleSeller: () => '',
      budgetDateValue: () => '', dateInRange: () => true, sortBudgets: rows => rows,
      dashboardBudgets: () => api.filteredBudgets(), BRL: { format: value => value },
      budgetSummary: budget => ({ gross: budget.value, net: budget.value, cost: budget.value, profit: budget.value }),
      document: { querySelector: id => { if (!totals.has(id)) totals.set(id, {}); return totals.get(id); } },
      renderChart: budgets => { chart = budgets; }, ORDER_STATUS: [],
    });
    api.renderBudgetDashboard();
    assert.deepEqual(Array.from(chart, row => row.budget.status), statuses.slice(2, 5));
    for (const id of ['#totalNet', '#totalCost', '#totalProfit']) assert.equal(totals.get(id).textContent, 12);
    state.financialStatuses = ['Recusado', 'Novo', 'Negocia\u00e7\u00e3o'];
    api.renderBudgetDashboard();
    assert.equal(chart.length, 0);
    assert.equal(totals.get('#totalNet').textContent, 0);
    state.financialStatuses = ['Aprovado', 'Finalizado'];
    assert.deepEqual(Array.from(api.filteredBudgets(), row => row.budget.status), ['Aprovado', 'Finalizado']);
  });
  test(`${app}: result filters hide excluded buttons and select all eligible statuses initially`, () => {
    const container = { innerHTML: '', children: [], appendChild(child) { this.children.push(child); } };
    const render = runInNewContext(`${allowedSource}\n${extract('function renderStatusFilters(', '\nfunction renderDashboard(')}\nrenderStatusFilters`, {
      state: { view: 'financial', financialStatuses: ['Todos'], appPreferences: {} },
      BUDGET_STATUS: statuses, ORDER_STATUS: [], STATUS: [], budgetStatusCounts: () => ({}), setStatusFilter() {},
      document: { createElement: () => ({ children: [], appendChild(child) { this.children.push(child); }, setAttribute() {}, addEventListener() {} }) },
    });
    render(container, 'Todos', 'financial');
    assert.deepEqual(container.children.map(button => button.children[0].textContent), statuses.slice(2, 5));
    assert.ok(container.children.every(button => button.className.includes('active')));
  });
}
