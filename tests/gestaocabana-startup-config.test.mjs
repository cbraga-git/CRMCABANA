import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const app = await readFile(new URL("../gestaocabana/app.js", import.meta.url), "utf8");
test("Gestao requires authentication even when hosting blocks the separate config script", () => {
  const start = app.indexOf("const CONFIG =");
  const end = app.indexOf("const FINANCE_MODULE_VIEWS", start);
  const authStart = app.indexOf("function remoteDatabaseEnabled()");
  const authEnd = app.indexOf("function currentUserId()", authStart);
  const result = runInNewContext(`${app.slice(start, end)}\n${app.slice(authStart, authEnd)}\n({ config: CONFIG, authenticated: authEnabled() })`, {
    window: { location: { href: "https://example.test/gestaocabana/?page=accounts" } }, URL,
  });
  assert.equal(result.config.supabaseUrl, "https://example.test/gestaocabana/api/index.php");
  assert.equal(result.config.profilesTable, "crm_profiles");
  assert.equal(result.authenticated, true);
});
