import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
const app = await readFile(new URL('../crmcabana/app.js', import.meta.url), 'utf8');
const start = app.indexOf('async function loadFinancialRegisters(');
const source = app.slice(start, app.indexOf('\nfunction renderFinancialAccounts()', start));
function harness(scope, fail = false, count = 2501) {
  const rows = Array.from({ length: count }, (_, i) => ({ id: String(i).padStart(6, '0'), competence_date: i < 1200 ? '2026-01-01' : '2026-05-01', created_at: '2026-01-01' }));
  const state = { financialScope: scope, financialScopeVersion: 0, financialEntries: [{ id: 'previous' }] };
  const requests = [];
  const load = runInNewContext(`${source}\nloadFinancialRegisters`, {
    state, remoteDatabaseEnabled: () => true, currentUserId: () => 'owner', canAccessFinancialScope: () => true,
    supabaseHeaders: () => ({}), supabaseTableEndpoint: (table, query, selected) => `https://test/${selected}/${table}${query}`,
    authorizedFetch: async (url) => {
      requests.push(url);
      const parsed = new URL(url);
      if (!parsed.pathname.endsWith('crm_financial_entries')) return { ok: true, json: async () => [] };
      const cursor = parsed.searchParams.get('id')?.slice(3);
      if (fail && cursor) return { ok: false };
      const page = rows.filter(row => !cursor || row.id > cursor).slice(0, 1000);
      return { ok: true, json: async () => page };
    },
  });
  return { load, state, requests };
}
for (const scope of ['company', 'braga']) test(`loads older history beyond 1000 rows in ${scope}`, async () => {
  const h = harness(scope);
  await h.load();
  assert.equal(h.state.financialEntries.length, 2501);
  assert.equal(new Set(h.state.financialEntries.map(row => row.id)).size, 2501);
  assert.equal(h.state.financialEntries.filter(row => row.competence_date === '2026-01-01').length, 1200);
  assert.equal(h.state.financialEntries[0].competence_date, '2026-05-01');
  assert.equal(h.requests.filter(url => url.includes('crm_financial_entries')).length, 3);
  assert.ok(h.requests.every(url => url.includes(`/${scope}/`)));
});
test('later page failure preserves previously loaded data', async () => {
  const h = harness('braga', true);
  await assert.rejects(h.load(), /Financeiro Braga/);
  assert.equal(h.state.financialEntries[0].id, 'previous');
});
test('exact page boundary finishes with an empty page', async () => {
  const h = harness('braga', false, 2000);
  await h.load();
  assert.equal(h.state.financialEntries.length, 2000);
  assert.equal(h.requests.filter(url => url.includes('crm_financial_entries')).length, 3);
});
