import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../crmcabana/styles.css", import.meta.url), "utf8");
const start = app.indexOf("function financialEntryPageBounds(");
const end = app.indexOf("\nfunction renderFinancialEntryPagination(", start);
assert.ok(start >= 0 && end > start);
const bounds = runInNewContext(`${app.slice(start, end)}\nfinancialEntryPageBounds`);

test("paginação divide transações em páginas de vinte itens e limita extremos", () => {
  assert.deepEqual({ ...bounds(45, 1, 20) }, { current: 1, pages: 3, start: 0, end: 20 });
  assert.deepEqual({ ...bounds(45, 3, 20) }, { current: 3, pages: 3, start: 40, end: 45 });
  assert.deepEqual({ ...bounds(45, 99, 20) }, { current: 3, pages: 3, start: 40, end: 45 });
  assert.deepEqual({ ...bounds(0, 1, 20) }, { current: 1, pages: 1, start: 0, end: 0 });
});

test("tela oferece navegação paginada e tabela compacta com menu recolhido", () => {
  assert.match(html, /id="financialEntryPagination"[\s\S]*?data-financial-entry-page="previous"[\s\S]*?data-financial-entry-page="next"/);
  assert.match(css, /body\[data-sidebar-collapsed="true"\] \.financial-module-view \{ max-width: none;/);
  assert.match(css, /body\[data-sidebar-collapsed="true"\] \.financial-entry-table \{ min-width: 0; table-layout: fixed;/);
});
