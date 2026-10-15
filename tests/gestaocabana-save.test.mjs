import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const app = await readFile(new URL('../gestaocabana/app.js', import.meta.url), 'utf8');
const source = app.slice(app.indexOf('async function saveRemoteClients('), app.indexOf('\nasync function trySyncPendingClients'));
function harness(fetch) {
  return runInNewContext(`${source}\n({saveRemoteClient, saveRemoteClients})`, {
    authorizedFetch: fetch, supabaseEndpoint: path => path, supabaseHeaders: prefer => ({Prefer: prefer}),
    currentUserId: () => 'user', serializeClientData: client => ({name: client.name}),
    AbortController, setTimeout, clearTimeout,
  });
}

test('PHP saves existing clients without protected ID and reuses server timestamp', async () => {
  let version = '2026-10-15T10:00:00.123456-03:00';
  const client = {id: 'client', name: 'Cliente', _remoteUpdatedAt: version};
  const api = harness(async (url, options) => {
    const request = options();
    assert.equal(request.method, 'PATCH');
    assert.ok(url.includes(encodeURIComponent(version)));
    assert.equal(Object.hasOwn(JSON.parse(request.body), 'id'), false);
    version = version.replace('10:00', '10:01');
    return {ok: true, json: async () => [{id: client.id, updated_at: version}]};
  });
  await api.saveRemoteClient(client);
  assert.equal(client._remoteUpdatedAt, version);
  await api.saveRemoteClient(client);
});

test('PHP bulk saves retain each confirmed timestamp', async () => {
  const clients = [{id: 'a'}, {id: 'b'}];
  const api = harness(async (_, options) => {
    assert.match(options().headers.Prefer, /return=representation/);
    return {ok: true, json: async () => [{id: 'b', updated_at: 'server-b'}, {id: 'a', updated_at: 'server-a'}]};
  });
  await api.saveRemoteClients(clients);
  assert.deepEqual(clients.map(client => client._remoteUpdatedAt), ['server-a', 'server-b']);
});

test('PHP still rejects concurrent updates and missing write confirmations', async () => {
  const api = harness(async () => ({ok: true, json: async () => []}));
  await assert.rejects(api.saveRemoteClient({id: 'a', _remoteUpdatedAt: 'previous'}), error => error.conflict === true);
  await assert.rejects(api.saveRemoteClients([{id: 'a'}]), /nao confirmou/);
});
