
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const app=await readFile(new URL('../gestaocabana/app.js', import.meta.url),'utf8');
const css=await readFile(new URL('../gestaocabana/styles.css', import.meta.url),'utf8');
const source=app.slice(app.indexOf('function financialFilterValues('),app.indexOf('\nfunction formatFinancialDate'));
const events=app.slice(app.indexOf('document.addEventListener("click", (event) => {\n  document.querySelectorAll(".financial-multi-filter[open]")'),app.indexOf('\ndocument.querySelector("#clearFinancialEntryFilters")',app.indexOf('document.querySelector("#financialEntryFilters")?.addEventListener("input"')));
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
try {
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.setContent(`<style>${css}</style><section id="financialEntriesPanel" class="financial-register"><div id="financialEntryFilters" class="financial-entry-filters"><div class="financial-filter-field"><span>Tipo</span><select id="financialEntryFilterType"><option value="">Todos</option><option value="income">Receita</option><option value="expense">Despesa</option><option value="transfer">Transferencia</option></select></div></div></section><button id="outside" style="position:fixed;right:8px;bottom:8px">Fora</button>`);
 await page.evaluate("(() => {"+source+`\nconst state={financialEntryFilters:{type:''}}; function escapeHtml(value){return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');} function renderFinancialEntries(){renderFinancialMultiFilter(document.querySelector('#financialEntryFilterType'),state.financialEntryFilters.type);} renderFinancialEntries();\n`+events+"})()");
 const picker=page.locator('.financial-multi-filter');
 await picker.locator('summary').click();
 await picker.locator('input[value="income"]').check();
 await picker.locator('input[value="expense"]').check();
 assert.equal(await picker.locator('input:checked').count(),2);
 assert.equal(await picker.getAttribute('open'),'');
 assert.match(await picker.locator('summary').innerText(),/Receita, Despesa/);
 await picker.locator('input[value="income"]').uncheck();
 assert.equal(await picker.locator('input:checked').count(),1);
 await picker.locator('input[value=""]').check();
 assert.equal(await picker.locator('input:checked').count(),1);
 assert.equal(await picker.locator('summary').innerText(),'Todos');
 await page.locator('#outside').click();
 assert.equal(await picker.getAttribute('open'),null);
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:800});
  await picker.locator('summary').click();
  const rect=await picker.locator('.financial-multi-options').boundingBox();
  assert.ok(rect.x>=0 && rect.x+rect.width<=width+1);
  assert.ok(await picker.locator('input[value="expense"]').isVisible());
  await page.locator('#outside').click();
 }
 console.log('UI: selecao multipla, limpar, fechar, desktop e celular validados.');
} finally {await browser.close();}
