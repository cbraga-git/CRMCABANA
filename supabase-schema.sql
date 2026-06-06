create table if not exists public.crm_clients (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.crm_clients
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.crm_clients enable row level security;

drop policy if exists "crm_clients_select" on public.crm_clients;
drop policy if exists "crm_clients_insert" on public.crm_clients;
drop policy if exists "crm_clients_update" on public.crm_clients;
drop policy if exists "crm_clients_delete" on public.crm_clients;

create policy "crm_clients_select"
on public.crm_clients
for select
using (auth.uid() = user_id);

create policy "crm_clients_insert"
on public.crm_clients
for insert
with check (auth.uid() = user_id);

create policy "crm_clients_update"
on public.crm_clients
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "crm_clients_delete"
on public.crm_clients
for delete
using (auth.uid() = user_id);
