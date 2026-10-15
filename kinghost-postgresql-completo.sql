-- CRM Cabana: estrutura PostgreSQL KingHost, versão inicial 14/10/2026.
-- Execute no banco previamente criado pelo painel KingHost (PostgreSQL 13+).
-- Não contém CREATE DATABASE, dados de produção, senhas ou serviços Supabase.
-- Use um banco vazio. API: SET LOCAL crm.user_id = '<UUID validado>' em cada transação.
-- API deve usar papel separado do proprietário, sem SUPERUSER/BYPASSRLS.
BEGIN;
SET LOCAL search_path = public, pg_catalog;
DO $$ BEGIN
  IF current_setting('server_version_num')::integer < 130000 THEN
    RAISE EXCEPTION 'Este script exige PostgreSQL 13 ou superior.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.crm_current_user_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('crm.user_id', true), '')::uuid;
$$;

CREATE TABLE IF NOT EXISTS public.crm_users (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  email text NOT NULL,
  password_hash text,
  email_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(trim(email)) BETWEEN 3 AND 320)
);
CREATE UNIQUE INDEX IF NOT EXISTS crm_users_email_uidx ON public.crm_users (lower(email));

create table if not exists public.crm_clients (
  id text primary key,
  user_id uuid not null references public.crm_users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_profiles (
  id uuid primary key references public.crm_users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  blocked boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.crm_users(id) on delete set null,
  actor_email text,
  action text not null,
  target_user_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_budget_statuses (
  name text primary key,
  applies_to_budget boolean not null default true,
  applies_to_order boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 60),
  check (applies_to_budget or applies_to_order)
);

create table if not exists public.crm_presence (
  session_id text primary key,
  user_id uuid not null references public.crm_users(id) on delete cascade,
  email text not null default '',
  last_seen timestamptz not null default now()
);


create table if not exists public.crm_financial_accounts (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null,
  account_type text not null default 'bank'
    check (account_type in ('bank', 'cash', 'credit_card', 'investment', 'other')),
  institution text,
  color text,
  initial_balance numeric(15,2) not null default 0,
  initial_balance_date date not null default current_date,
  closing_day smallint check (closing_day between 1 and 31),
  due_day smallint check (due_day between 1 and 31),
  credit_limit numeric(15,2) check (credit_limit is null or credit_limit >= 0),
  active boolean not null default true,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 120),
  check (account_type = 'credit_card' or (closing_day is null and due_day is null and credit_limit is null))
);

create table if not exists public.crm_financial_categories (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null,
  category_type text not null check (category_type in ('income', 'expense', 'both')),
  parent_id uuid references public.crm_financial_categories(id) on delete restrict,
  color text,
  icon text,
  active boolean not null default true,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 100),
  check (parent_id is null or parent_id <> id),
  unique (name, category_type)
);

create table if not exists public.crm_financial_cost_centers (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 100)
);

create table if not exists public.crm_financial_entries (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  entry_type text not null check (entry_type in ('income', 'expense', 'transfer')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  account_id uuid not null references public.crm_financial_accounts(id) on delete restrict,
  transfer_account_id uuid references public.crm_financial_accounts(id) on delete restrict,
  category_id uuid references public.crm_financial_categories(id) on delete restrict,
  cost_center_id uuid references public.crm_financial_cost_centers(id) on delete restrict,
  description text not null,
  notes text,
  amount numeric(15,2) not null check (amount > 0),
  issue_date date not null default current_date,
  competence_date date not null default current_date,
  due_date date,
  paid_at timestamptz,
  installment_number integer check (installment_number is null or installment_number > 0),
  installment_count integer check (installment_count is null or installment_count > 0),
  installment_group_id uuid,
  recurrence_group_id uuid,
  client_id text references public.crm_clients(id) on delete set null,
  source_type text not null default 'manual'
    check (source_type in ('manual', 'statement', 'sale', 'recurrence', 'adjustment')),
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(description)) between 1 and 240),
  check (
    (entry_type = 'transfer' and transfer_account_id is not null and transfer_account_id <> account_id and category_id is null)
    or
    (entry_type <> 'transfer' and transfer_account_id is null)
  ),
  check (installment_count is null or installment_number is null or installment_number <= installment_count),
  check ((status = 'paid' and paid_at is not null) or status <> 'paid')
);

create table if not exists public.crm_financial_statement_imports (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  account_id uuid not null references public.crm_financial_accounts(id) on delete restrict,
  file_name text not null,
  file_type text not null check (file_type in ('ofx', 'csv')),
  file_hash text not null,
  period_start date,
  period_end date,
  item_count integer not null default 0 check (item_count >= 0),
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'cancelled', 'failed')),
  error_message text,
  imported_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (length(trim(file_name)) between 1 and 255),
  unique (account_id, file_hash)
);

create table if not exists public.crm_financial_statement_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  import_id uuid not null references public.crm_financial_statement_imports(id) on delete cascade,
  account_id uuid not null references public.crm_financial_accounts(id) on delete restrict,
  external_id text,
  transaction_date date not null,
  description text not null,
  amount numeric(15,2) not null check (amount <> 0),
  balance numeric(15,2),
  fingerprint text not null,
  reconciliation_status text not null default 'pending'
    check (reconciliation_status in ('pending', 'reconciled', 'ignored')),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (length(trim(description)) between 1 and 500),
  unique (account_id, fingerprint)
);

create table if not exists public.crm_financial_reconciliations (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  statement_item_id uuid not null references public.crm_financial_statement_items(id) on delete cascade,
  entry_id uuid not null references public.crm_financial_entries(id) on delete cascade,
  amount numeric(15,2) not null check (amount > 0),
  reconciled_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  reconciled_at timestamptz not null default now(),
  unique (statement_item_id, entry_id)
);

create table if not exists public.crm_financial_budgets (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  year smallint not null check (year between 2000 and 2200),
  month smallint not null check (month between 1 and 12),
  category_id uuid not null references public.crm_financial_categories(id) on delete restrict,
  cost_center_id uuid references public.crm_financial_cost_centers(id) on delete restrict,
  planned_amount numeric(15,2) not null check (planned_amount >= 0),
  notes text,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crm_financial_budgets_scope_uidx
  on public.crm_financial_budgets (year, month, category_id, coalesce(cost_center_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index if not exists crm_financial_entries_account_date_idx
  on public.crm_financial_entries (account_id, competence_date desc);
create index if not exists crm_financial_entries_due_status_idx
  on public.crm_financial_entries (due_date, status) where status = 'pending';
create index if not exists crm_financial_entries_category_idx
  on public.crm_financial_entries (category_id, competence_date desc);
create index if not exists crm_financial_entries_client_idx
  on public.crm_financial_entries (client_id) where client_id is not null;
create index if not exists crm_financial_statement_items_import_idx
  on public.crm_financial_statement_items (import_id, transaction_date);
create index if not exists crm_financial_statement_items_pending_idx
  on public.crm_financial_statement_items (account_id, transaction_date)
  where reconciliation_status = 'pending';
create index if not exists crm_financial_reconciliations_entry_idx
  on public.crm_financial_reconciliations (entry_id);

create or replace function public.crm_financial_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists crm_financial_accounts_updated_at on public.crm_financial_accounts;
create trigger crm_financial_accounts_updated_at before update on public.crm_financial_accounts
for each row execute function public.crm_financial_set_updated_at();

drop trigger if exists crm_financial_categories_updated_at on public.crm_financial_categories;
create trigger crm_financial_categories_updated_at before update on public.crm_financial_categories
for each row execute function public.crm_financial_set_updated_at();

drop trigger if exists crm_financial_cost_centers_updated_at on public.crm_financial_cost_centers;
create trigger crm_financial_cost_centers_updated_at before update on public.crm_financial_cost_centers
for each row execute function public.crm_financial_set_updated_at();

drop trigger if exists crm_financial_entries_updated_at on public.crm_financial_entries;
create trigger crm_financial_entries_updated_at before update on public.crm_financial_entries
for each row execute function public.crm_financial_set_updated_at();

drop trigger if exists crm_financial_budgets_updated_at on public.crm_financial_budgets;
create trigger crm_financial_budgets_updated_at before update on public.crm_financial_budgets
for each row execute function public.crm_financial_set_updated_at();


create table if not exists public.crm_braga_financial_accounts (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null,
  account_type text not null default 'bank'
    check (account_type in ('bank', 'cash', 'credit_card', 'investment', 'other')),
  institution text,
  color text,
  initial_balance numeric(15,2) not null default 0,
  initial_balance_date date not null default current_date,
  closing_day smallint check (closing_day between 1 and 31),
  due_day smallint check (due_day between 1 and 31),
  credit_limit numeric(15,2) check (credit_limit is null or credit_limit >= 0),
  active boolean not null default true,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 120),
  check (account_type = 'credit_card' or (closing_day is null and due_day is null and credit_limit is null))
);

create table if not exists public.crm_braga_financial_categories (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null,
  category_type text not null check (category_type in ('income', 'expense', 'both')),
  parent_id uuid references public.crm_braga_financial_categories(id) on delete restrict,
  color text,
  icon text,
  active boolean not null default true,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 100),
  check (parent_id is null or parent_id <> id),
  unique (name, category_type)
);

create table if not exists public.crm_braga_financial_cost_centers (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 100)
);

create table if not exists public.crm_braga_financial_entries (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  entry_type text not null check (entry_type in ('income', 'expense', 'transfer')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  account_id uuid not null references public.crm_braga_financial_accounts(id) on delete restrict,
  transfer_account_id uuid references public.crm_braga_financial_accounts(id) on delete restrict,
  category_id uuid references public.crm_braga_financial_categories(id) on delete restrict,
  cost_center_id uuid references public.crm_braga_financial_cost_centers(id) on delete restrict,
  description text not null,
  notes text,
  amount numeric(15,2) not null check (amount > 0),
  issue_date date not null default current_date,
  competence_date date not null default current_date,
  due_date date,
  paid_at timestamptz,
  installment_number integer check (installment_number is null or installment_number > 0),
  installment_count integer check (installment_count is null or installment_count > 0),
  installment_group_id uuid,
  recurrence_group_id uuid,
  client_id text check (client_id is null),
  source_type text not null default 'manual'
    check (source_type in ('manual', 'statement', 'recurrence', 'adjustment')),
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(description)) between 1 and 240),
  check (
    (entry_type = 'transfer' and transfer_account_id is not null and transfer_account_id <> account_id and category_id is null)
    or
    (entry_type <> 'transfer' and transfer_account_id is null)
  ),
  check (installment_count is null or installment_number is null or installment_number <= installment_count),
  check ((status = 'paid' and paid_at is not null) or status <> 'paid')
);

create table if not exists public.crm_braga_financial_statement_imports (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  account_id uuid not null references public.crm_braga_financial_accounts(id) on delete restrict,
  file_name text not null,
  file_type text not null check (file_type in ('ofx', 'csv')),
  file_hash text not null,
  period_start date,
  period_end date,
  item_count integer not null default 0 check (item_count >= 0),
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'cancelled', 'failed')),
  error_message text,
  imported_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (length(trim(file_name)) between 1 and 255),
  unique (account_id, file_hash)
);

create table if not exists public.crm_braga_financial_statement_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  import_id uuid not null references public.crm_braga_financial_statement_imports(id) on delete cascade,
  account_id uuid not null references public.crm_braga_financial_accounts(id) on delete restrict,
  external_id text,
  transaction_date date not null,
  description text not null,
  amount numeric(15,2) not null check (amount <> 0),
  balance numeric(15,2),
  fingerprint text not null,
  reconciliation_status text not null default 'pending'
    check (reconciliation_status in ('pending', 'reconciled', 'ignored')),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (length(trim(description)) between 1 and 500),
  unique (account_id, fingerprint)
);

create table if not exists public.crm_braga_financial_reconciliations (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  statement_item_id uuid not null references public.crm_braga_financial_statement_items(id) on delete cascade,
  entry_id uuid not null references public.crm_braga_financial_entries(id) on delete cascade,
  amount numeric(15,2) not null check (amount > 0),
  reconciled_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  reconciled_at timestamptz not null default now(),
  unique (statement_item_id, entry_id)
);

create table if not exists public.crm_braga_financial_budgets (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  year smallint not null check (year between 2000 and 2200),
  month smallint not null check (month between 1 and 12),
  category_id uuid not null references public.crm_braga_financial_categories(id) on delete restrict,
  cost_center_id uuid references public.crm_braga_financial_cost_centers(id) on delete restrict,
  planned_amount numeric(15,2) not null check (planned_amount >= 0),
  notes text,
  created_by uuid not null default public.crm_current_user_id() references public.crm_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crm_braga_financial_budgets_scope_uidx
  on public.crm_braga_financial_budgets (year, month, category_id, coalesce(cost_center_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index if not exists crm_braga_financial_entries_account_date_idx
  on public.crm_braga_financial_entries (account_id, competence_date desc);
create index if not exists crm_braga_financial_entries_due_status_idx
  on public.crm_braga_financial_entries (due_date, status) where status = 'pending';
create index if not exists crm_braga_financial_entries_category_idx
  on public.crm_braga_financial_entries (category_id, competence_date desc);
create index if not exists crm_braga_financial_entries_client_idx
  on public.crm_braga_financial_entries (client_id) where client_id is not null;
create index if not exists crm_braga_financial_statement_items_import_idx
  on public.crm_braga_financial_statement_items (import_id, transaction_date);
create index if not exists crm_braga_financial_statement_items_pending_idx
  on public.crm_braga_financial_statement_items (account_id, transaction_date)
  where reconciliation_status = 'pending';
create index if not exists crm_braga_financial_reconciliations_entry_idx
  on public.crm_braga_financial_reconciliations (entry_id);

create or replace function public.crm_braga_financial_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists crm_braga_financial_accounts_updated_at on public.crm_braga_financial_accounts;
create trigger crm_braga_financial_accounts_updated_at before update on public.crm_braga_financial_accounts
for each row execute function public.crm_braga_financial_set_updated_at();

drop trigger if exists crm_braga_financial_categories_updated_at on public.crm_braga_financial_categories;
create trigger crm_braga_financial_categories_updated_at before update on public.crm_braga_financial_categories
for each row execute function public.crm_braga_financial_set_updated_at();

drop trigger if exists crm_braga_financial_cost_centers_updated_at on public.crm_braga_financial_cost_centers;
create trigger crm_braga_financial_cost_centers_updated_at before update on public.crm_braga_financial_cost_centers
for each row execute function public.crm_braga_financial_set_updated_at();

drop trigger if exists crm_braga_financial_entries_updated_at on public.crm_braga_financial_entries;
create trigger crm_braga_financial_entries_updated_at before update on public.crm_braga_financial_entries
for each row execute function public.crm_braga_financial_set_updated_at();

drop trigger if exists crm_braga_financial_budgets_updated_at on public.crm_braga_financial_budgets;
create trigger crm_braga_financial_budgets_updated_at before update on public.crm_braga_financial_budgets
for each row execute function public.crm_braga_financial_set_updated_at();


-- Orçamentos, itens e contas bancárias de documentos permanecem no JSON crm_clients.data.
INSERT INTO public.crm_budget_statuses (name, applies_to_budget, applies_to_order, sort_order)
VALUES ('Novo', true, false, 0), ('Negociação', true, false, 1),
 ('Aprovado', true, true, 2), ('Pedido', true, true, 3),
 ('Emissão de NF', true, true, 4), ('Finalizado', true, false, 5),
 ('Recusado', true, false, 6)
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS crm_clients_user_idx ON public.crm_clients(user_id);
CREATE INDEX IF NOT EXISTS crm_clients_updated_idx ON public.crm_clients(updated_at DESC);
CREATE INDEX IF NOT EXISTS crm_presence_last_seen_idx ON public.crm_presence(last_seen DESC);
CREATE INDEX IF NOT EXISTS crm_audit_logs_created_idx ON public.crm_audit_logs(created_at DESC);

-- Funções pertencem ao proprietário das tabelas para consultar os perfis sem recursão RLS.
CREATE OR REPLACE FUNCTION public.crm_is_active_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.crm_profiles WHERE id = public.crm_current_user_id() AND NOT blocked);
$$;
CREATE OR REPLACE FUNCTION public.crm_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.crm_profiles WHERE id = public.crm_current_user_id() AND role = 'admin' AND NOT blocked);
$$;
CREATE OR REPLACE FUNCTION public.crm_can_access_braga_finance()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.crm_users u JOIN public.crm_profiles p ON p.id = u.id
 WHERE u.id = public.crm_current_user_id() AND lower(u.email) = 'fernandes.braga@gmail.com' AND NOT p.blocked);
$$;

-- A criação e alteração de credenciais/perfis cabem exclusivamente à API administrativa.
ALTER TABLE public.crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_budget_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_users_read ON public.crm_users;
CREATE POLICY crm_users_read ON public.crm_users FOR SELECT USING (public.crm_is_admin() OR (id = public.crm_current_user_id() AND public.crm_is_active_user()));
DROP POLICY IF EXISTS crm_profiles_read ON public.crm_profiles;
CREATE POLICY crm_profiles_read ON public.crm_profiles FOR SELECT USING (public.crm_is_admin() OR (id = public.crm_current_user_id() AND public.crm_is_active_user()));
DROP POLICY IF EXISTS crm_clients_access ON public.crm_clients;
CREATE POLICY crm_clients_access ON public.crm_clients FOR ALL
 USING (public.crm_is_admin() OR (user_id = public.crm_current_user_id() AND public.crm_is_active_user()))
 WITH CHECK (public.crm_is_admin() OR (user_id = public.crm_current_user_id() AND public.crm_is_active_user()));
DROP POLICY IF EXISTS crm_statuses_read ON public.crm_budget_statuses;
CREATE POLICY crm_statuses_read ON public.crm_budget_statuses FOR SELECT USING (public.crm_is_active_user());
DROP POLICY IF EXISTS crm_statuses_admin ON public.crm_budget_statuses;
CREATE POLICY crm_statuses_admin ON public.crm_budget_statuses FOR ALL USING (public.crm_is_admin()) WITH CHECK (public.crm_is_admin());
DROP POLICY IF EXISTS crm_audit_read ON public.crm_audit_logs;
CREATE POLICY crm_audit_read ON public.crm_audit_logs FOR SELECT USING (public.crm_is_admin());
DROP POLICY IF EXISTS crm_audit_insert ON public.crm_audit_logs;
CREATE POLICY crm_audit_insert ON public.crm_audit_logs FOR INSERT WITH CHECK (public.crm_is_admin() AND actor_id = public.crm_current_user_id());
DROP POLICY IF EXISTS crm_presence_read ON public.crm_presence;
CREATE POLICY crm_presence_read ON public.crm_presence FOR SELECT USING (public.crm_is_active_user());
DROP POLICY IF EXISTS crm_presence_write ON public.crm_presence;
CREATE POLICY crm_presence_write ON public.crm_presence FOR ALL
 USING (user_id = public.crm_current_user_id() AND public.crm_is_active_user())
 WITH CHECK (user_id = public.crm_current_user_id() AND public.crm_is_active_user());

DO $$
DECLARE table_name text; access_expression text;
BEGIN
 FOREACH table_name IN ARRAY ARRAY[
  'crm_financial_accounts','crm_financial_categories','crm_financial_cost_centers',
  'crm_financial_entries','crm_financial_statement_imports','crm_financial_statement_items',
  'crm_financial_reconciliations','crm_financial_budgets',
  'crm_braga_financial_accounts','crm_braga_financial_categories','crm_braga_financial_cost_centers',
  'crm_braga_financial_entries','crm_braga_financial_statement_imports','crm_braga_financial_statement_items',
  'crm_braga_financial_reconciliations','crm_braga_financial_budgets']
 LOOP
  access_expression := CASE WHEN table_name LIKE 'crm_braga_%' THEN 'public.crm_can_access_braga_finance()' ELSE 'public.crm_is_admin()' END;
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('DROP POLICY IF EXISTS kinghost_financial_access ON public.%I', table_name);
  EXECUTE format('CREATE POLICY kinghost_financial_access ON public.%I FOR ALL USING (%s) WITH CHECK (%s)', table_name, access_expression, access_expression);
 END LOOP;
END $$;

-- Sem concessões automáticas a PUBLIC. Defina os papéis privados conforme sua API.
REVOKE ALL ON public.crm_users FROM PUBLIC;
REVOKE ALL ON public.crm_profiles FROM PUBLIC;
COMMIT;
