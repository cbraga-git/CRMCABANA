import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../crmcabana/styles.css", import.meta.url), "utf8");

test("atualiza os dados compartilhados periodicamente e ao voltar para a aba", () => {
  assert.match(app, /const LIVE_SYNC_INTERVAL_MS = 5000;/);
  assert.match(app, /window\.setInterval\(syncLiveData, LIVE_SYNC_INTERVAL_MS\)/);
  assert.match(app, /document\.addEventListener\("visibilitychange"/);
  assert.match(app, /window\.addEventListener\("focus", syncLiveData\)/);
  assert.match(app, /window\.addEventListener\("online", syncLiveData\)/);
  assert.match(app, /await loadRemoteClients\(\)/);
  assert.match(app, /await loadFinancialRegisters\(\)/);
  assert.match(app, /startLiveSync\(\);/);
});

test("preserva edições locais ainda não salvas durante a atualização", () => {
  assert.match(app, /hasPendingSync\(\) \|\| state\.projectDirty \|\| state\.budgetDirty \|\| state\.clientDialogDirty/);
  assert.match(app, /!liveClientRefreshBlocked\(\)/);
  assert.match(app, /!liveFinancialRefreshBlocked\(\)/);
});

test("exibe o estado da conexão somente quando a sincronização remota está ativa", () => {
  assert.match(html, /id="liveSyncChip" hidden/);
  assert.match(html, /id="liveSyncStatus">Online/);
  assert.match(html, /app\.js\?v=161/);
  assert.match(css, /\.live-sync-chip\[hidden\] \{ display: none; \}/);
  assert.match(app, /elements\.liveSyncChip\.hidden = !state\.session \|\| !remoteDatabaseEnabled\(\)/);
});
