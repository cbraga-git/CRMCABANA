// UI integration validation; all Supabase requests are intercepted locally.
// PLAYWRIGHT_MODULE may point to an external Playwright installation.
// BROWSER_EXECUTABLE may point to an installed Chrome/Edge executable.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = new URL("../", import.meta.url);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, "http://localhost").pathname;
    const file = new URL(`.${path}`, root);
    if (!file.href.startsWith(root.href)) throw new Error("Invalid path");
    response.setHeader("Content-Type", mime[extname(file.pathname)] || "application/octet-stream");
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
const url = `http://127.0.0.1:${server.address().port}/crmcabana/index.html`;
const errors = [];
let checks = 0;

async function scenario(email, role, missingPersonal = false) {
  const context = await browser.newContext();
  const today = new Date().toISOString().slice(0, 10);
  const uid = randomUUID();
  const requests = [];
  const tables = {};
  for (const [scope, name] of [["crm_financial_", "Company"], ["crm_braga_financial_", "Personal"]]) {
    const accountId = randomUUID();
    tables[`${scope}accounts`] = [{ id: accountId, name: `${name} bank`, account_type: "bank", active: true, initial_balance: 100, initial_balance_date: today }];
    tables[`${scope}categories`] = [];
    tables[`${scope}entries`] = [{ id: randomUUID(), description: `${name} entry`, account_id: accountId, entry_type: "expense", status: "pending", amount: 10, issue_date: today, competence_date: today, due_date: today, notes: `${name} notes` }];
    tables[`${scope}statement_imports`] = [];
  }
  await context.addInitScript(({ email, uid }) => sessionStorage.setItem("movelcrm-session", JSON.stringify({
    access_token: "mock-access-token", refresh_token: "mock-refresh-token", user: { id: uid, email },
  })), { email, uid });
  await context.route("https://*.supabase.co/**", async (route) => {
    const request = route.request();
    const address = new URL(request.url());
    const table = address.pathname.split("/").at(-1);
    requests.push({ table, method: request.method() });
    if (missingPersonal && table.startsWith("crm_braga_financial_")) {
      return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ code: "PGRST205" }) });
    }
    let rows = table === "crm_profiles" ? [{ id: uid, email, role, blocked: false }] : tables[table] || [];
    if (request.method() === "POST" && table.startsWith("crm_braga_financial_")) {
      const payload = request.postDataJSON();
      rows = (Array.isArray(payload) ? payload : [payload]).map((row) => ({ ...row, id: row.id || randomUUID() }));
      tables[table] = [...(tables[table] || []), ...rows];
    }
    await route.fulfill({ contentType: "application/json", headers: { "content-range": `0-${Math.max(0, rows.length - 1)}/${rows.length}` }, body: JSON.stringify(rows) });
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", (dialog) => dialog.dismiss());
  await page.goto(url);
  await page.locator("#crmShell:not([hidden]) .view.active").waitFor();
  return { context, page, requests, tables };
}

try {
  const owner = await scenario("fernandes.braga@gmail.com", "admin");
  await owner.page.locator('body[data-view="financeTransactions"]').waitFor();
  assert.equal(await owner.page.locator("#bragaFinancialNavGroup").isVisible(), true);
  await owner.page.locator("#bragaFinancialNavToggle").click();
  await owner.page.locator('#bragaFinancialSubmenu [data-view="financeTransactions"]').click();
  await owner.page.locator('body[data-financial-scope="braga"]').waitFor();
  assert.equal(await owner.page.locator("body").evaluate((node) => getComputedStyle(node).backgroundColor), "rgb(0, 0, 0)");
  assert.equal(await owner.page.locator("#financialEntriesPanel").evaluate((node) => getComputedStyle(node).backgroundColor), "rgb(12, 12, 12)");
  assert.equal(await owner.page.locator("#financialEntryFilterSearch").evaluate((node) => getComputedStyle(node).backgroundColor), "rgb(22, 22, 22)");
  assert.match(await owner.page.locator("#financialEntryRows").innerText(), /Personal Entry/);
  assert.doesNotMatch(await owner.page.locator("#financialEntryRows").innerText(), /Company Entry/);
  await owner.page.locator("#financialColumnPicker summary").click();
  await owner.page.locator('[data-financial-column="notes"]').check();
  assert.equal(await owner.page.locator("#financialEntryRows .financial-entry-notes").isVisible(), true);
  await owner.page.locator('#financialSubmenu [data-view="financeTransactions"]').click();
  await owner.page.locator('body[data-financial-scope="company"]').waitFor();
  assert.notEqual(await owner.page.locator("body").evaluate((node) => getComputedStyle(node).backgroundImage), "none");
  assert.match(await owner.page.locator("#financialEntryRows").innerText(), /Company Entry/);
  assert.equal(await owner.page.locator("#financialEntryRows .financial-entry-notes").isVisible(), false);
  await owner.page.locator('#bragaFinancialSubmenu [data-view="financeAccounts"]').click();
  await owner.page.locator('body[data-financial-scope="braga"]').waitFor();
  await owner.page.locator("#newFinancialAccountBtn").click();
  assert.equal(await owner.page.locator("#financialAccountName").evaluate((node) => getComputedStyle(node).color), "rgb(245, 245, 245)");
  // A scope switch is refused while a financial form is open.
  await owner.page.evaluate(() => showView("financeAccounts", undefined, "company"));
  assert.equal(await owner.page.evaluate(() => state.financialScope), "braga");
  await owner.page.locator("#financialAccountName").fill("New personal account");
  await owner.page.locator('#financialAccountForm button[type="submit"]').click();
  await owner.page.locator("#financialAccountDialog").waitFor({ state: "hidden" });
  assert.ok(owner.requests.some((request) => request.table === "crm_braga_financial_accounts" && request.method === "POST"));
  assert.equal(owner.tables.crm_financial_accounts.length, 1);
  await owner.page.locator('#bragaFinancialSubmenu [data-view="reports"]').click();
  await owner.page.locator('body[data-view="reports"]').waitFor();
  assert.equal(await owner.page.locator(".reports-panel").evaluate((node) => getComputedStyle(node).backgroundColor), "rgb(12, 12, 12)");
  assert.equal(await owner.page.locator("#reportsKind").inputValue(), "transactions");
  assert.equal(await owner.page.locator("#reportsClientField").isVisible(), false);
  assert.equal(await owner.page.locator("#reportsKind").isDisabled(), true);
  checks += 18;
  await owner.context.close();

  const regularOwner = await scenario("fernandes.braga@gmail.com", "user");
  await regularOwner.page.locator('body[data-financial-scope="braga"]').waitFor();
  assert.equal(await regularOwner.page.locator("#bragaFinancialNavGroup").isVisible(), true);
  assert.equal(await regularOwner.page.locator("#financialNavGroup").isVisible(), false);
  assert.ok(regularOwner.requests.filter((request) => request.table.includes("financial_")).every((request) => request.table.startsWith("crm_braga_financial_")));
  checks += 3;
  await regularOwner.context.close();

  const otherAdmin = await scenario("other@example.com", "admin");
  await otherAdmin.page.locator('body[data-view="budget"]').waitFor();
  assert.equal(await otherAdmin.page.locator("#bragaFinancialNavGroup").isVisible(), false);
  await otherAdmin.page.evaluate(() => showView("financeTransactions", undefined, "braga"));
  assert.equal(await otherAdmin.page.evaluate(() => state.financialScope), "company");
  assert.ok(!otherAdmin.requests.some((request) => request.table.startsWith("crm_braga_financial_")));
  checks += 3;
  await otherAdmin.context.close();

  const unavailable = await scenario("fernandes.braga@gmail.com", "admin", true);
  await unavailable.page.locator('body[data-view="financeTransactions"]').waitFor();
  await unavailable.page.locator("#bragaFinancialNavToggle").click();
  await unavailable.page.locator('#bragaFinancialSubmenu [data-view="financeTransactions"]').click();
  await unavailable.page.locator('body[data-financial-scope="braga"]').waitFor();
  assert.match(await unavailable.page.locator("#financialScopeMessage").innerText(), /supabase-financeiro-braga.sql/);
  assert.doesNotMatch(await unavailable.page.locator("#financialEntryRows").innerText(), /Company Entry/);
  checks += 2;
  await unavailable.context.close();
  if (process.env.MOBILLS_WORKBOOK) {
    const migration = await scenario("fernandes.braga@gmail.com", "user");
    await migration.page.locator('body[data-financial-scope="braga"]').waitFor();
    migration.page.removeAllListeners("dialog");
    const messages = [];
    migration.page.on("dialog", async (dialog) => { messages.push(dialog.message()); await dialog.accept(); });
    await migration.page.locator('#bragaFinancialSubmenu [data-view="financeImport"]').click();
    await migration.page.locator('body[data-view="financeImport"]').waitFor();
    await migration.page.locator("#financialMigrationFile").setInputFiles(process.env.MOBILLS_WORKBOOK);
    const deadline = Date.now() + 30000;
    while (await migration.page.evaluate(() => state.financialOperations > 0)) {
      if (Date.now() > deadline) throw new Error("Migration timed out");
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    console.log("Migration result:", await migration.page.locator("#financialImportMessage").innerText());
    const rows = migration.tables.crm_braga_financial_entries;
    console.log("Migration validation:", JSON.stringify({
      records: rows.length - 1, income: rows.filter((row) => row.entry_type === "income").length,
      expense: rows.filter((row) => row.entry_type === "expense").length - 1,
      missingAccounts: rows.filter((row) => !row.account_id).length,
      paid: rows.filter((row) => row.status === "paid").length,
      accounts: migration.tables.crm_braga_financial_accounts.length,
      categories: migration.tables.crm_braga_financial_categories.length,
      alerts: messages.filter((message) => !message.startsWith("Migrar ")),
    }));
    await migration.context.close();
  }
  const documentBank = await scenario("other@example.com", "admin");
  for (let attempt = 0; await documentBank.page.evaluate(() => liveSyncTimer === null); attempt++) {
    if (attempt > 200) throw new Error("App initialization timed out");
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  await documentBank.page.evaluate(async () => {
    state.clients = [{ ...defaultClients()[0], id: "bank-client", name: "Cliente teste", status: WON_STATUS, active: "SIM", budgets: [] }];
    state.selectedId = "bank-client";
    // Persistence is mocked; the app's form, registry and document rendering run normally.
    saveClients = async (ids) => { window.savedBankClientIds = ids; return true; };
    await showView("budget");
    await openBudgetEditor("bank-client", { blank: true });
    document.querySelector("#budgetClientSelect").value = "bank-client";
  });
  assert.equal(await documentBank.page.locator("#budgetBankCode").inputValue(), "341");
  await documentBank.page.locator("#budgetBankAccountSelect").selectOption("");
  await documentBank.page.locator("#budgetBankLabel").fill("Cabana Santander");
  await documentBank.page.locator("#budgetBankName").fill("Santander");
  await documentBank.page.locator("#budgetBankCode").fill("033");
  await documentBank.page.locator("#budgetBankAgency").fill("1234");
  await documentBank.page.locator("#budgetBankNumber").fill("98765-0");
  await documentBank.page.locator("#budgetBankPix").fill("financeiro@example.test");
  await documentBank.page.locator("#budgetBankRegister").click();
  assert.match(await documentBank.page.locator("#budgetBankMessage").innerText(), /Conta cadastrada/);
  assert.deepEqual(await documentBank.page.evaluate(() => window.savedBankClientIds), ["bank-client"]);
  const chosen = await documentBank.page.evaluate(() => readBudgetPaymentPlan().bankAccount);
  assert.equal(chosen.code, "033");
  const header = await documentBank.page.evaluate(() => documentCompanyHeaderRows({ budget: currentBudgetDraft() }));
  assert.match(header, /Santander - 033/);
  assert.match(header, /98765-0/);
  await documentBank.page.locator("#budgetBankAccountSelect").selectOption("cabana-itau");
  assert.equal(await documentBank.page.locator("#budgetBankCode").inputValue(), "341");
  await documentBank.page.evaluate((account) => fillBudgetPaymentPlan({ enabled: false, bankAccount: account }), chosen);
  assert.equal(await documentBank.page.locator("#budgetBankNumber").inputValue(), "98765-0");
  checks += 8;
  await documentBank.context.close();
  assert.deepEqual(errors, []);
  console.log(`Financeiro Braga: ${checks} browser checks passed (owner, other admin, isolated CRUD, column preferences and missing migration).`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
