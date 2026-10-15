import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto, createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import test from "node:test";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const start = app.indexOf("async function sha256(");
const end = app.indexOf("\nasync function ", start + 1);
const code = app.slice(start, end) + "\nsha256";

test("contexto sem criptografia orienta HTTPS sem erro de digest indefinido", async () => {
  for (const crypto of [undefined, {}]) {
    const hash = runInNewContext(code, { crypto, TextEncoder, ArrayBuffer });
    await assert.rejects(hash("orcamento"), /Abra o CRM por HTTPS/);
  }
});

test("SHA256 preserva hashes e identificadores usados no financeiro", async () => {
  const hash = runInNewContext(code, { crypto: webcrypto, TextEncoder, ArrayBuffer });
  for (const value of ["", "abc", "crm-budget-financial:budget-1:plan-entry", "Orçamento com acentuação"]) {
    assert.equal(await hash(value), createHash("sha256").update(value).digest("hex"));
  }
  const buffer = new TextEncoder().encode("arquivo").buffer;
  assert.equal(await hash(buffer), createHash("sha256").update("arquivo").digest("hex"));
});
