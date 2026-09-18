import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const html = await readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../crmcabana/styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");

test("navegação móvel oferece botão, painel e fechamento acessíveis", () => {
  assert.match(html, /id="mobileMenuToggle"[^>]*aria-controls="mainSidebar"[^>]*aria-expanded="false"/);
  assert.match(html, /id="mobileMenuBackdrop"[^>]*hidden/);
  assert.match(html, /id="mainSidebar"/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.sidebar \{ position: fixed;[\s\S]*?translateX\(-102%\)/);
  assert.match(css, /body\[data-mobile-menu-open="true"\] \.sidebar \{ transform: translateX\(0\)/);
  assert.match(app, /state\.view = view;\s*document\.body\.dataset\.view = view;\s*setMobileMenuOpen\(false\)/);
});

test("menu móvel fica fora da tabulação quando fechado e retorna ao abrir", () => {
  const start = app.indexOf("function setMobileMenuOpen(open) {");
  const end = app.indexOf("\ndocument.querySelector(\"#mobileMenuToggle\")", start);
  assert.ok(start >= 0 && end > start);
  const attributes = {};
  const toggle = { setAttribute: (name, value) => { attributes[name] = value; } };
  const sidebar = { inert: false };
  const backdrop = { hidden: true };
  const media = { matches: true };
  const document = {
    body: { dataset: {} },
    querySelector: (selector) => ({ "#mobileMenuToggle": toggle, "#mainSidebar": sidebar, "#mobileMenuBackdrop": backdrop })[selector],
  };
  const setMobileMenuOpen = runInNewContext(`${app.slice(start, end)}\nsetMobileMenuOpen`, { document, mobileMenuMedia: media });
  setMobileMenuOpen(false);
  assert.equal(sidebar.inert, true);
  assert.equal(backdrop.hidden, true);
  assert.equal(attributes["aria-expanded"], "false");
  setMobileMenuOpen(true);
  assert.equal(sidebar.inert, false);
  assert.equal(backdrop.hidden, false);
  assert.equal(attributes["aria-expanded"], "true");
  media.matches = false;
  setMobileMenuOpen(false);
  assert.equal(sidebar.inert, false);
});

test("tabelas e formulários têm adaptações próprias para telas estreitas", () => {
  assert.match(html, /id="clientsListCard"[\s\S]*?class="mobile-table-hint"/);
  assert.match(html, /id="budgetListCard"[\s\S]*?class="mobile-table-hint"/);
  assert.match(css, /#clientsListCard, #budgetListCard \{ max-height: 65dvh; \}/);
  assert.match(css, /\.table-card, \.table-wrap \{ max-width: 100%; overflow-x: auto;/);
  assert.match(css, /\.dialog-grid > \.span-2 \{ grid-column: 1; \}/);
  assert.match(css, /\.cash-payment-table tbody tr \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /input, select, textarea \{ min-width: 0; font-size: 16px; \}/);
  assert.match(css, /#budgetEditor input, #budgetEditor select,[^\n]*\{ font-size: 16px; \}/);
});
