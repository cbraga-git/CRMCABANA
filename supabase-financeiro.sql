-- CRM Cabana - modulo Financeiro
-- Migracao aditiva: nao altera nem remove tabelas existentes do CRM.
-- Execute este arquivo no SQL Editor do Supabase como proprietario do projeto.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.crm_financial_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
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
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 120),
  check (account_type = 'credit_card' or (closing_day is null and due_day is null and credit_limit is null))
);

create table if not exists public.crm_financial_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  category_type text not null check (category_type in ('income', 'expense', 'both')),
  parent_id uuid references public.crm_financial_categories(id) on delete restrict,
  color text,
  icon text,
  active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 100),
  check (parent_id is null or parent_id <> id),
  unique (name, category_type)
);

create table if not exists public.crm_financial_cost_centers (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(name)) between 1 and 100)
);

create table if not exists public.crm_financial_entries (
  id uuid primary key default extensions.gen_random_uuid(),
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
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
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
  id uuid primary key default extensions.gen_random_uuid(),
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
  imported_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (length(trim(file_name)) between 1 and 255),
  unique (account_id, file_hash)
);

create table if not exists public.crm_financial_statement_items (
  id uuid primary key default extensions.gen_random_uuid(),
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
  id uuid primary key default extensions.gen_random_uuid(),
  statement_item_id uuid not null references public.crm_financial_statement_items(id) on delete cascade,
  entry_id uuid not null references public.crm_financial_entries(id) on delete cascade,
  amount numeric(15,2) not null check (amount > 0),
  reconciled_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  reconciled_at timestamptz not null default now(),
  unique (statement_item_id, entry_id)
);

create table if not exists public.crm_financial_budgets (
  id uuid primary key default extensions.gen_random_uuid(),
  year smallint not null check (year between 2000 and 2200),
  month smallint not null check (month between 1 and 12),
  category_id uuid not null references public.crm_financial_categories(id) on delete restrict,
  cost_center_id uuid references public.crm_financial_cost_centers(id) on delete restrict,
  planned_amount numeric(15,2) not null check (planned_amount >= 0),
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
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

-- O modulo comeca restrito a administradores, como o menu atual do CRM.
alter table public.crm_financial_accounts enable row level security;
alter table public.crm_financial_categories enable row level security;
alter table public.crm_financial_cost_centers enable row level security;
alter table public.crm_financial_entries enable row level security;
alter table public.crm_financial_statement_imports enable row level security;
alter table public.crm_financial_statement_items enable row level security;
alter table public.crm_financial_reconciliations enable row level security;
alter table public.crm_financial_budgets enable row level security;

revoke all on table
  public.crm_financial_accounts,
  public.crm_financial_categories,
  public.crm_financial_cost_centers,
  public.crm_financial_entries,
  public.crm_financial_statement_imports,
  public.crm_financial_statement_items,
  public.crm_financial_reconciliations,
  public.crm_financial_budgets
from anon, authenticated;

grant select, insert, update, delete on table
  public.crm_financial_accounts,
  public.crm_financial_categories,
  public.crm_financial_cost_centers,
  public.crm_financial_entries,
  public.crm_financial_statement_imports,
  public.crm_financial_statement_items,
  public.crm_financial_reconciliations,
  public.crm_financial_budgets
to authenticated;

do $$
declare
  table_name text;
  policy_action text;
begin
  foreach table_name in array array[
    'crm_financial_accounts', 'crm_financial_categories', 'crm_financial_cost_centers',
    'crm_financial_entries', 'crm_financial_statement_imports', 'crm_financial_statement_items',
    'crm_financial_reconciliations', 'crm_financial_budgets'
  ] loop
    foreach policy_action in array array['select', 'insert', 'update', 'delete'] loop
      execute format('drop policy if exists %I on public.%I', table_name || '_admin_' || policy_action, table_name);
      if policy_action = 'insert' then
        execute format('create policy %I on public.%I for insert to authenticated with check (public.crm_is_admin())', table_name || '_admin_' || policy_action, table_name);
      elsif policy_action = 'update' then
        execute format('create policy %I on public.%I for update to authenticated using (public.crm_is_admin()) with check (public.crm_is_admin())', table_name || '_admin_' || policy_action, table_name);
      else
        execute format('create policy %I on public.%I for %s to authenticated using (public.crm_is_admin())', table_name || '_admin_' || policy_action, table_name, policy_action);
      end if;
    end loop;
  end loop;
end;
$$;

revoke execute on function public.crm_financial_set_updated_at() from public, anon, authenticated;

select pg_notify('pgrst', 'reload schema');

commit;
