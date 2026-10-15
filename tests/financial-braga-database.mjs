// Integration validation with a disposable PostgreSQL (PGlite) database.
// PGlite is a development-only tool, not a CRM runtime dependency.
// Set PGLITE_MODULE to its module path or install @electric-sql/pglite locally.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
const owner = "00000000-0000-0000-0000-000000000001";
const admin = "00000000-0000-0000-0000-000000000002";
const user = "00000000-0000-0000-0000-000000000003";
const id = (n) => `10000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
let checks = 0;

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create schema extensions;
    create table auth.users (id uuid primary key, email text not null);
    create table public.crm_profiles (id uuid primary key references auth.users(id), role text, blocked boolean not null default false);
    create table public.crm_clients (id text primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function extensions.gen_random_uuid() returns uuid language sql as $$ select gen_random_uuid() $$;
    create function public.crm_is_admin() returns boolean language sql stable security definer as
      $$ select exists(select 1 from public.crm_profiles where id = auth.uid() and role = 'admin' and not blocked) $$;
    grant usage on schema public, auth, extensions to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${owner}', 'fernandes.braga@gmail.com'), ('${admin}', 'admin@example.com'), ('${user}', 'user@example.com');
    insert into public.crm_profiles values ('${owner}', 'user', false), ('${admin}', 'admin', false), ('${user}', 'user', false);
  `);
  // PGlite supplies gen_random_uuid in core; the Supabase extension namespace
  // is provided above so the rest of the migration runs without modification.
  const migration = async (name) => (await readFile(new URL(`../${name}`, import.meta.url), "utf8"))
    .replace("create extension if not exists pgcrypto with schema extensions;", "");
  await db.exec(await migration("supabase-financeiro.sql"));
  const personalMigration = await migration("supabase-financeiro-braga.sql");
  await db.exec(personalMigration);
  await db.exec(personalMigration); // migration is repeatable

  const switchUser = async (uid, role = "authenticated") => {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false); set role ${role};`);
  };
  const denied = async (sql) => {
    await assert.rejects(db.query(sql), (error) => error.code === "42501");
    checks++;
  };
  const prefix = "crm_braga_financial_";
  const fixtures = [
    ["accounts", { id: id(1), name: "Personal bank", account_type: "bank" }, { name: "Updated bank" }],
    ["categories", { id: id(2), name: "Personal expense", category_type: "expense" }, { name: "Updated category" }],
    ["cost_centers", { id: id(3), name: "Personal center" }, { description: "Updated center" }],
    ["entries", { id: id(4), entry_type: "expense", account_id: id(1), category_id: id(2), description: "Personal entry", amount: 10 }, { amount: 11 }],
    ["statement_imports", { id: id(5), account_id: id(1), file_name: "personal.ofx", file_type: "ofx", file_hash: "base" }, { file_name: "updated.ofx" }],
    ["statement_items", { id: id(6), import_id: id(5), account_id: id(1), transaction_date: "2026-10-05", description: "Personal item", amount: -10, fingerprint: "base" }, { description: "Updated item" }],
    ["reconciliations", { id: id(7), statement_item_id: id(6), entry_id: id(4), amount: 10 }, { amount: 11 }],
    ["budgets", { id: id(8), year: 2026, month: 10, category_id: id(2), planned_amount: 100 }, { planned_amount: 110 }],
  ];
  const insert = async (table, row) => {
    const columns = Object.keys(row);
    return db.query(`insert into public.${table} (${columns.join(",")}) values (${columns.map((_, n) => `$${n + 1}`).join(",")}) returning *`, Object.values(row));
  };

  // The owner is deliberately a regular CRM user, not an administrator.
  await switchUser(owner);
  assert.equal((await db.query("select public.crm_can_access_braga_finance() as allowed")).rows[0].allowed, true);
  for (const [suffix, row] of fixtures) await insert(prefix + suffix, row);
  await insert(prefix + "entries", { id: id(9), entry_type: "expense", account_id: id(1), description: "Second personal entry", amount: 20 });

  for (const uid of [admin, user]) {
    await switchUser(uid);
    // Spoofing a JWT email does not grant ownership: the helper reads Auth.
    await db.query("select set_config('request.jwt.claim.email', 'fernandes.braga@gmail.com', false)");
    assert.equal((await db.query("select public.crm_can_access_braga_finance() as allowed")).rows[0].allowed, false);
    for (const [suffix, row, update] of fixtures) {
      const table = prefix + suffix;
      assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
      const [field, value] = Object.entries(update)[0];
      assert.equal((await db.query(`update public.${table} set ${field} = $1 returning id`, [value])).rows.length, 0);
      assert.equal((await db.query(`delete from public.${table} returning id`)).rows.length, 0);
      await assert.rejects(insert(table, { ...row, id: id(100) }), (error) => error.code === "42501");
      checks += 4;
    }
  }

  await switchUser("", "anon");
  for (const [suffix] of fixtures) await denied(`select * from public.${prefix}${suffix}`);
  await denied("select public.crm_can_access_braga_finance()");

  // Blocked owners immediately lose access, without waiting for JWT expiry.
  await db.exec(`reset role; update public.crm_profiles set blocked = true where id = '${owner}';`);
  await switchUser(owner);
  assert.equal((await db.query("select public.crm_can_access_braga_finance() as allowed")).rows[0].allowed, false);
  assert.equal((await db.query(`select * from public.${prefix}accounts`)).rows.length, 0);
  await assert.rejects(insert(prefix + "accounts", { name: "Blocked" }), (error) => error.code === "42501");
  checks += 3;
  await db.exec(`reset role; update public.crm_profiles set blocked = false where id = '${owner}';`);

  // A later permissive admin policy cannot broaden the restrictive owner gate.
  await db.exec(`create policy regression_allow_everyone on public.${prefix}accounts for all to authenticated using (true) with check (true);`);
  await switchUser(admin);
  assert.equal((await db.query(`select * from public.${prefix}accounts`)).rows.length, 0);
  await assert.rejects(insert(prefix + "accounts", { name: "Admin bypass" }), (error) => error.code === "42501");
  checks += 2;
  await db.exec(`reset role; drop policy regression_allow_everyone on public.${prefix}accounts;`);

  // The business account cannot be referenced by a personal transaction.
  await db.exec(`insert into public.crm_financial_accounts (id, name, created_by) values ('${id(500)}', 'Business account', '${admin}');`);
  await switchUser(owner);
  await assert.rejects(insert(prefix + "entries", { account_id: id(500), entry_type: "expense", description: "Wrong account", amount: 1 }), (error) => error.code === "23503");
  await assert.rejects(insert(prefix + "entries", { account_id: id(1), entry_type: "expense", description: "Wrong client", amount: 1, client_id: "business-client" }), (error) => error.code === "23514");
  checks += 2;

  // Owner can create, read, update and delete records in every personal table.
  for (const [suffix, row, update] of fixtures) {
    const table = prefix + suffix;
    const tempId = id(200);
    const temp = { ...row, id: tempId };
    if ("name" in temp) temp.name += " temporary";
    if ("file_hash" in temp) temp.file_hash = "temporary";
    if ("fingerprint" in temp) temp.fingerprint = "temporary";
    if (suffix === "reconciliations") temp.entry_id = id(9);
    if (suffix === "budgets") temp.month = 11;
    assert.equal((await insert(table, temp)).rows.length, 1);
    assert.equal((await db.query(`select * from public.${table} where id = $1`, [tempId])).rows.length, 1);
    const [field, value] = Object.entries(update)[0];
    assert.equal((await db.query(`update public.${table} set ${field} = $1 where id = $2 returning id`, [value, tempId])).rows.length, 1);
    assert.equal((await db.query(`delete from public.${table} where id = $1 returning id`, [tempId])).rows.length, 1);
    checks += 4;
  }
  await db.exec("reset role");
  assert.equal((await db.query("select count(*)::int as count from public.crm_financial_accounts")).rows[0].count, 1);
  assert.equal((await db.query("select count(*)::int as count from public.crm_financial_entries")).rows[0].count, 0);
  console.log(`Financeiro Braga: ${checks} database checks passed (RLS, CRUD, isolation, blocked owner and repeatable migration).`);
} finally {
  await db.close();
}
