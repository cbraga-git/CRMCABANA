import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("async function recoverBudgetSaveConflict(clientId, previousBudget, budgetPayload) {");
const end = app.indexOf("\nasync function saveBudget(options = {})", start);
assert.ok(start >= 0 && end > start);

function recoveryHarness(remoteBudget) {
  let saved = null;
  const state = { clients: [{ id: "client-1", name: "Versão antiga" }] };
  const context = {
    state,
    authorizedFetch: async () => ({ ok: true, json: async () => [{ user_id: "user-1", updated_at: "server-v2", data: { id: "client-1", name: "Nome atualizado", city: "Cidade nova", budgets: remoteBudget ? [remoteBudget] : [] } }] }),
    supabaseEndpoint: (path) => path,
    supabaseHeaders: () => ({}),
    normalizeClientBudgetStatus: (client) => client,
    normalizeClientStatus: (client) => client,
    budgetIdentity: (budget) => budget?.id,
    clientBudgetHistory: (client) => [...(client.budgets || [])],
    normalizedBudgetCode: (code) => String(code || "").toUpperCase(),
    saveRemoteClient: async (client) => { saved = structuredClone(client); },
  };
  const recover = runInNewContext(`${app.slice(start, end)}\nrecoverBudgetSaveConflict`, context);
  return { recover, state, saved: () => saved };
}

test("conflito em outra parte do cliente preserva dados remotos e reaplica somente o orçamento", async () => {
  const previous = { id: "budget-1", code: "100", updatedAt: "budget-v1", rows: [{ gross: 10 }] };
  const edited = { ...previous, updatedAt: "budget-v2", rows: [{ gross: 20 }] };
  const harness = recoveryHarness(previous);
  assert.equal(await harness.recover("client-1", previous, edited), true);
  assert.equal(harness.saved().name, "Nome atualizado");
  assert.equal(harness.saved().city, "Cidade nova");
  assert.deepEqual(harness.saved().budgets[0].rows, [{ gross: 20 }]);
  assert.equal(harness.state.clients[0].name, "Nome atualizado");
});

test("conflito no próprio orçamento não sobrescreve servidor e mantém editor aberto", async () => {
  const previous = { id: "budget-1", code: "100", updatedAt: "budget-v1" };
  const remote = { ...previous, updatedAt: "budget-alterado-em-outra-sessao" };
  const edited = { ...previous, updatedAt: "budget-v2" };
  const harness = recoveryHarness(remote);
  await assert.rejects(harness.recover("client-1", previous, edited), /Suas alterações continuam abertas/);
  assert.equal(harness.saved(), null);
  assert.equal(harness.state.clients[0].name, "Versão antiga");
});

test("salvar orçamento ativa recuperação apenas para conflito de um cliente", () => {
  assert.match(app, /changedIds\.length === 1[\s\S]*?onConflict: \(\) => recoverBudgetSaveConflict/);
  assert.match(app, /const recovered = await options\.onConflict\(error\);[\s\S]*?if \(recovered\)[\s\S]*?return true;/);
});
