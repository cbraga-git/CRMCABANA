import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [app, html, schema, workflow] = await Promise.all([
  readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8"),
  readFile(new URL("../crmcabana/index.html", import.meta.url), "utf8"),
  readFile(new URL("../supabase-schema.sql", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
]);

test("cadastro publico nao e oferecido nem chamado pelo cliente", () => {
  assert.doesNotMatch(html, /Criar nova conta|id="authToggle"/i);
  assert.doesNotMatch(app, /\/signup|function signUp\s*\(/);
});

test("sessao autenticada nao e persistida no localStorage", () => {
  assert.match(app, /sessionStorage\.setItem\(SESSION_KEY/);
  assert.doesNotMatch(app, /localStorage\.setItem\(SESSION_KEY/);
});

test("inicializacao para quando o perfil nao autoriza acesso", () => {
  assert.match(app, /const accessAllowed = await ensureUserProfile\(\)/);
  assert.match(app, /if \(!accessAllowed\)[\s\S]*?showAuthScreen\(\)[\s\S]*?return false/);
});

test("administrador precisa estar desbloqueado", () => {
  assert.match(schema, /role = 'admin'\s+and blocked = false/);
});

test("helpers privilegiados nao sao executaveis por clientes", () => {
  assert.match(schema, /revoke execute on function public\.crm_hash_password\(text\) from public, anon, authenticated/);
  assert.match(schema, /revoke execute on function public\.crm_log_action\(text, uuid, text, jsonb\) from public, anon, authenticated/);
  assert.match(schema, /grant execute on function public\.crm_admin_create_user\(text, text, text\) to authenticated/);
});

test("pagina define politica de seguranca de conteudo", () => {
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /frame-ancestors 'none'/);
});

test("financeiro usa navegacao propria e preserva o painel de orcamentos", () => {
  assert.match(html, /<span class="nav-label">Financeiro<\/span>/);
  assert.match(html, /id="financialNavToggle"[^>]*aria-expanded="false"/);
  assert.match(html, /id="financialSubmenu" hidden/);
  for (const view of ["financeOverview", "financeAccounts", "financeTransactions", "financePayable", "financeReceivable", "financeImport", "financeCategories", "financePlanning"]) {
    assert.match(html, new RegExp(`data-view="${view}"`));
  }
  for (const view of ["financePayable", "financeReceivable", "financePlanning"]) {
    assert.match(html, new RegExp(`data-view="${view}"[^>]*hidden`));
  }
  assert.match(html, /id="reportsNavItem"[^>]*data-view="reports"/);
  assert.match(html, /id="reportsView"[\s\S]*?id="reportsForm"[\s\S]*?id="reportsExportBtn"/);
  assert.match(app, /view === "reports"\) renderReportsView\(\)/);
  assert.match(html, /data-view="financial" title="Resultados de orçamentos"/);
  assert.match(app, /isFinanceModuleView\(view\)/);
  assert.match(app, /supabaseTableEndpoint\("crm_financial_accounts"/);
  assert.match(app, /supabaseTableEndpoint\("crm_financial_categories"/);
  assert.match(app, /function submitFinancialAccount/);
  assert.match(app, /function submitFinancialCategory/);
  assert.match(app, /function submitFinancialEntry/);
  assert.match(app, /function importFinancialStatement/);
  assert.match(app, /crm_financial_statement_imports/);
  assert.match(html, /data-delete-financial-entry|id="financialEntryDialog"/);
  assert.match(app, /release_date/);
  assert.match(app, /transaction_net_amount/);
  assert.match(app, /reference_id/);
  assert.match(app, /partial_balance/);
  assert.match(app, /function openFinancialImport/);
  assert.match(app, /function confirmSelectedStatementItems/);
  assert.match(app, /crm_financial_reconciliations/);
  assert.match(html, /id="financialStatementItemRows"/);
  assert.match(app, /\+ Criar nova categoria/);
  assert.match(app, /financialCategoryTargetItemId/);
  assert.match(app, /Transferência entre contas/);
  assert.match(app, /data-statement-transfer-account/);
  assert.match(app, /function addMonthsToFinancialDate/);
  assert.match(app, /installment_group_id/);
  assert.match(html, /id="financialEntryInstallmentCount"/);
  assert.match(app, /financialCategoryTargetEntry/);
  assert.match(html, /id="financialMigrationFile"/);
  assert.match(app, /function migrateMobillsWorkbook/);
  assert.match(app, /resolution=ignore-duplicates/);
  assert.match(app, /ensureCategory/);
  assert.match(app, /account_id: accountMap[\s\S]*?transfer_account_id: null[\s\S]*?category_id:/);
  assert.match(html, /id="financialDashboardMonth"/);
  assert.doesNotMatch(html, /id="financialDashboardAccounts"/);
  assert.match(html, /id="financialAccountsPanel"[\s\S]*?id="financialAccountsMonth"[\s\S]*?id="financialAccountRows"/);
  assert.match(app, /data-financial-account-transactions/);
  assert.match(app, /data-financial-account-expense/);
  assert.match(html, /id="financialEvolutionChartBtn"/);
  assert.match(html, /id="financialEvolutionTableBtn"/);
  assert.match(html, /id="financialEvolutionRows"/);
  assert.match(html, /id="financialEntriesContext"/);
  assert.match(html, /id="financialEntryFilters"/);
  assert.match(html, /id="financialEntryFilterType"[\s\S]*?value="income"[\s\S]*?value="expense"[\s\S]*?value="transfer"/);
  assert.match(app, /view === "financeTransactions" && filters\.type && entry\.entry_type !== filters\.type/);
  assert.match(app, /#clearFinancialEntryFilters"\)\?\.addEventListener\("click", \(\) => \{[\s\S]*?state\.financialEntryMonthFilter = currentFinancialMonth\(\)/);
  assert.match(html, /financial-entry-dialog-grid/);
  assert.match(app, /function renderFinancialDashboard/);
  assert.match(app, /function financialAccountBalance/);
  assert.match(app, /entry\.entry_type === "transfer"/);
});

test("orcamento e pedido incluem campos Nobilia e ocultam vendedor no cabecalho", () => {
  assert.match(html, /id="budgetNobiliaId"/);
  assert.match(html, /id="budgetNobiliaDate"/);
  assert.match(html, /<label\s+hidden>\s*Vendedor\s*<input[^>]*id="budgetSeller"[^>]*>/i);
  assert.match(app, /nobiliaId|nobiliaDate/);
});

test("frete do orcamento aceita valor fixo ou percentual", () => {
  assert.match(html, /id="budgetFreightMode"/);
  assert.match(app, /settings\.freightMode === "percent"/);
  assert.match(app, /totalFactory \* percentToRate\(freightInput\)/);
});

test("listagem de orcamentos exibe o campo ID Nobilia apos o ID do orçamento", () => {
  assert.match(html, /ID Nobilia|ID NOBILIA/);
  assert.match(app, /budget\.nobiliaId|nobiliaId.*budget\.code|budget\.code.*nobiliaId/);
});

test("listagem de orcamentos exibe contato e permite buscar e ordenar pelo campo", () => {
  assert.match(html, /data-sort="client"[^>]*>Cliente<\/th>\s*<th data-sort="contact"[^>]*>Contato<\/th>/);
  assert.match(app, /contact: item\.budget\.contact \?\? item\.client\.contact \?\? ""/);
  assert.match(app, /searchableValues[\s\S]*?client\.contact/);
  assert.match(app, /combinedCodeValue,\s*client\.name,\s*budget\.contact \?\? client\.contact,/);
});

test("orçamento exibe contato do cliente ao lado da data da venda", () => {
  assert.match(html, /id="budgetSaleAtField"[\s\S]*?id="budgetSaleAt"[\s\S]*?id="budgetContactField"[\s\S]*?id="budgetContact"/);
  assert.doesNotMatch(html, /id="budgetContact"[^>]*readonly/);
  assert.match(app, /budget\.contact \?\? targetClient\?\.contact/);
  assert.match(app, /contact: elements\.budgetContact\?\.value\.trim\(\) \|\| ""/);
  assert.doesNotMatch(app, /budgetContactField\.hidden/);
});

test("ambientes aparecem antes da demonstração de pagamentos no orçamento", () => {
  const environments = html.indexOf('class="project-editor budget-environments"');
  const payments = html.indexOf('class="payments-grid"');
  const footer = html.indexOf('class="budget-footer-grid"');
  assert.ok(environments >= 0 && payments > environments && footer > payments);
});

test("dados da montagem salvam favorecido e chave Pix", () => {
  assert.match(html, /id="budgetAssemblyBeneficiary"/);
  assert.match(html, /id="budgetAssemblyPixKey"/);
  assert.match(app, /assemblyBeneficiary:\s*budgetInputValue\("budgetAssemblyBeneficiary"\)\.trim\(\)/);
  assert.match(app, /assemblyPixKey:\s*budgetInputValue\("budgetAssemblyPixKey"\)\.trim\(\)/);
  assert.match(app, /settings\.assemblyBeneficiary \|\| ""/);
  assert.match(app, /settings\.assemblyPixKey \|\| ""/);
});

test("filtros de status de orcamento exibem contagem discreta por categoria", () => {
  assert.match(app, /pill-count|statusCounts|renderStatusFilters/);
  assert.match(app, /count.*status|status.*count/i);
});

test("preferencias visuais do CRM persistem no navegador entre sessoes", () => {
  assert.match(app, /APP_PREFERENCES_KEY|appPreferences|localStorage\.setItem\(APP_PREFERENCES_KEY/);
  assert.match(app, /budgetCodeSeparator|statusCountsVisible|showNobilia/);
});

test("status padrao de orcamento usa Novo e aparece imediatamente apos Todos", () => {
  assert.match(app, /name:\s*"Novo"|"Novo"/);
  assert.doesNotMatch(app, /Novo\s+Orçamento/);
  assert.match(app, /\[\s*"Todos"\s*,\s*\.\.\.documentStatuses\s*\]|\[\s*"Todos"\s*,\s*\.\.\./);
});

test("status legado de orcamento e pedido sao migrados para os nomes atuais", () => {
  assert.match(app, /function\s+normalizeBudgetStatusValue\s*\(/);
  assert.doesNotMatch(app, /Novo\s+Orçamento/);
});

test("status de orcamento sao carregados antes dos clientes", () => {
  const startApp = app.match(/async function startApp\(\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.ok(startApp.indexOf("await loadBudgetStatuses()") < startApp.indexOf("state.clients = await loadClients()"));
});

test("actions do deploy usam commits imutaveis", () => {
  const actionRefs = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/g)].map((match) => match[1]);
  assert.ok(actionRefs.length >= 3);
  actionRefs.forEach((ref) => assert.match(ref, /^[a-f0-9]{40}$/));
});

test("deploy valida a versão antes de publicar sem interromper implantação ativa", () => {
  assert.match(workflow, /cancel-in-progress:\s*false/);
  assert.match(workflow, /validate:[\s\S]*?npm run check[\s\S]*?npm test/);
  assert.match(workflow, /deploy:[\s\S]*?needs: validate/);
  assert.match(workflow, /GITHUB_SHA::7/);
  assert.match(workflow, /Verify release artifact/);
});
