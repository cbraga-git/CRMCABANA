import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { runInNewContext } from "node:vm";

const app = await readFile(new URL("../crmcabana/app.js", import.meta.url), "utf8");
const extract = (start, end) => app.slice(app.indexOf(start), app.indexOf(end, app.indexOf(start)));
const dateSource = extract("function formatPrintDate(", "\nfunction formatPrintDateTime(");

for (const timezone of ["America/Sao_Paulo", "America/Los_Angeles", "UTC", "Pacific/Kiritimati"]) {
  test(`printed calendar dates preserve the form's day in ${timezone}`, () => {
    const source = `${dateSource}\nconsole.log(JSON.stringify(["2026-10-01", "2026-11-01", "2026-12-01", "2028-02-29"].map((value) => formatPrintDate(value))));`;
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", source], {
      env: { ...process.env, TZ: timezone }, encoding: "utf8",
    });
    assert.equal(child.status, 0, child.stderr);
    assert.deepEqual(JSON.parse(child.stdout), ["01/10/2026", "01/11/2026", "01/12/2026", "29/02/2028"]);
  });
}

test("timestamp dates retain local-time conversion and invalid dates stay empty", () => {
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", `${dateSource}\nconsole.log(JSON.stringify([formatPrintDate("2026-10-01T01:00:00Z"), formatPrintDate("invalid")]));`], {
    env: { ...process.env, TZ: "America/Sao_Paulo" }, encoding: "utf8",
  });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), ["30/09/2026", ""]);
});

test("order payment table and annex match the supplied form including manual due dates", () => {
  const core = extract("const BUDGET_PAYMENT_RATE_MATRIX =", "\nfunction readBudgetPaymentPlan(");
  const documentSource = extract("function orderPaymentRows(", "\nconst ORDER_ITEMS_PER_PAGE") +
    extract("function buildPaymentRows(", "\nfunction buildOrderPage(") +
    extract("function buildBudgetPaymentPlanDocument(", "\nfunction buildQuoteDocument(");
  const api = runInNewContext(`${core}\n${dateSource}\n${documentSource}\n({ orderPaymentRows, buildPaymentRows, buildBudgetPaymentPlanDocument })`, {
    BRL: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    escapeHtml: (value) => String(value ?? ""), formatPercent: (value) => String(value * 100),
    printField: (label, value) => `<div>${label}: ${value}</div>`,
    documentWithRepeatingHeader: (_context, content) => content,
  });
  const context = {
    client: { name: "Cliente" }, settings: {}, totals: { net: 159327.26 },
    budget: { code: "002-082026", paymentPlan: {
      enabled: true, entry: 59730, months: 2, rate: 0, rateAuto: false,
      entryMethod: "PIX", method: "Boleto", entryDate: "2026-10-01", firstDueDate: "2026-11-01",
    } },
  };
  const rows = api.orderPaymentRows(context);
  assert.deepEqual(Array.from(rows, (row) => ({ ...row, value: row.value.replaceAll("\u00a0", " ") })), [
    { parcel: "Entrada", value: "R$ 59.730,00", dueDate: "01/10/2026", method: "PIX" },
    { parcel: "1/2", value: "R$ 49.798,63", dueDate: "01/11/2026", method: "Boleto" },
    { parcel: "2/2", value: "R$ 49.798,63", dueDate: "01/12/2026", method: "Boleto" },
  ]);
  for (const content of [api.buildPaymentRows(context), api.buildBudgetPaymentPlanDocument(context)]) {
    for (const date of ["01/10/2026", "01/11/2026", "01/12/2026"]) assert.ok(content.includes(date));
  }
  context.budget.paymentPlan.dueDates = { "plan-income-2": "2026-12-15" };
  assert.equal(api.orderPaymentRows(context)[2].dueDate, "15/12/2026");
  assert.match(api.buildBudgetPaymentPlanDocument(context), /15\/12\/2026/);
});
