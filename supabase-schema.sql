create table if not exists public.crm_clients (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  updated_at timestamptz not null default now()
);

alter table public.crm_clients
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.crm_profiles
add column if not exists email text;

alter table public.crm_profiles
add column if not exists role text not null default 'user';

alter table public.crm_profiles
add column if not exists updated_at timestamptz not null default now();

do $$
begin
  alter table public.crm_profiles
  add constraint crm_profiles_role_check check (role in ('admin', 'user'));
exception
  when duplicate_object then null;
end $$;

alter table public.crm_clients enable row level security;
alter table public.crm_profiles enable row level security;

create or replace function public.crm_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.crm_profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.crm_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.crm_profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'user')
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists crm_on_auth_user_created on auth.users;
create trigger crm_on_auth_user_created
after insert on auth.users
for each row execute function public.crm_handle_new_user();

insert into public.crm_profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

drop policy if exists "crm_clients_select" on public.crm_clients;
drop policy if exists "crm_clients_insert" on public.crm_clients;
drop policy if exists "crm_clients_update" on public.crm_clients;
drop policy if exists "crm_clients_delete" on public.crm_clients;
drop policy if exists "crm_profiles_select" on public.crm_profiles;
drop policy if exists "crm_profiles_insert_self" on public.crm_profiles;
drop policy if exists "crm_profiles_update_admin" on public.crm_profiles;

create policy "crm_clients_select"
on public.crm_clients
for select
using (auth.uid() = user_id or public.crm_is_admin());

create policy "crm_clients_insert"
on public.crm_clients
for insert
with check (auth.uid() = user_id or public.crm_is_admin());

create policy "crm_clients_update"
on public.crm_clients
for update
using (auth.uid() = user_id or public.crm_is_admin())
with check (auth.uid() = user_id or public.crm_is_admin());

create policy "crm_clients_delete"
on public.crm_clients
for delete
using (auth.uid() = user_id or public.crm_is_admin());

create policy "crm_profiles_select"
on public.crm_profiles
for select
using (auth.uid() = id or public.crm_is_admin());

create policy "crm_profiles_insert_self"
on public.crm_profiles
for insert
with check (auth.uid() = id and role = 'user');

create policy "crm_profiles_update_admin"
on public.crm_profiles
for update
using (public.crm_is_admin())
with check (public.crm_is_admin());

-- Para definir o primeiro administrador, rode uma vez no Supabase SQL Editor:
-- update public.crm_profiles set role = 'admin' where email = 'email@empresa.com';
