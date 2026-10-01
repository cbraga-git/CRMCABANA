import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../crmcabana/styles.css", import.meta.url), "utf8");
test("tela exibe transações continuamente, sem navegação paginada", () => {
  assert.doesNotMatch(html, /id="financialEntryPagination"/);
  assert.doesNotMatch(app, /function financialEntryPageBounds\(/);
  assert.match(css, /body\[data-sidebar-collapsed="true"\] \.financial-module-view \{ max-width: none;/);
  assert.match(css, /body\[data-sidebar-collapsed="true"\] \.financial-entry-table \{ min-width: 0; table-layout: fixed;/);
  assert.match(css, /body\[data-view="financeTransactions"\]:not\(\[data-sidebar-collapsed="true"\]\) \.financial-entry-filters/);
  assert.match(css, /body\[data-view="financeTransactions"\]:not\(\[data-sidebar-collapsed="true"\]\) \.financial-entry-table \{/);
});
