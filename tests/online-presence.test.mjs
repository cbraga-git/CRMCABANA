import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const schema = await readFile(new URL("../supabase-schema.sql", import.meta.url), "utf8");

test("menu lateral lista usuarios conectados e identifica a sessao atual", () => {
  assert.match(html, /id="onlineUsersPanel" hidden/);
  assert.match(html, /id="onlineUsersCount"/);
  assert.match(html, /id="onlineUsersList"/);
  assert.match(app, /name\.textContent = `\$\{user\.email\.split\("@"\)\[0\]/);
  assert.match(app, /user\.user_id === currentUserId\(\) \? " \(voce\)"/);
});

test("presenca usa heartbeat, janela de expiracao e elimina abas duplicadas", () => {
  assert.match(app, /PRESENCE_HEARTBEAT_INTERVAL_MS = 15000/);
  assert.match(app, /PRESENCE_ONLINE_WINDOW_MS = 45000/);
  assert.match(app, /on_conflict=session_id/);
  assert.match(app, /last_seen=gte/);
  assert.match(app, /new Map\(\)/);
  assert.match(app, /uniqueUsers\.has\(row\.user_id\)/);
});

test("tabela de presenca permite leitura autenticada e escrita somente pelo proprio usuario", () => {
  assert.match(schema, /create table if not exists public\.crm_presence/);
  assert.match(schema, /for select using \(auth\.uid\(\) is not null\)/);
  assert.match(schema, /crm_presence_insert_self[\s\S]*auth\.uid\(\) = user_id/);
  assert.match(schema, /crm_presence_update_self[\s\S]*auth\.uid\(\) = user_id/);
  assert.match(schema, /crm_presence_delete_self[\s\S]*auth\.uid\(\) = user_id/);
});
