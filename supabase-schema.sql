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
  blocked boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_user_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.crm_clients
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.crm_profiles
add column if not exists email text;

alter table public.crm_profiles
add column if not exists role text not null default 'user';

alter table public.crm_profiles
add column if not exists blocked boolean not null default false;

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
alter table public.crm_audit_logs enable row level security;

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
drop policy if exists "crm_audit_logs_select_admin" on public.crm_audit_logs;
drop policy if exists "crm_audit_logs_insert_admin" on public.crm_audit_logs;

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

create policy "crm_audit_logs_select_admin"
on public.crm_audit_logs
for select
using (public.crm_is_admin());

create policy "crm_audit_logs_insert_admin"
on public.crm_audit_logs
for insert
with check (public.crm_is_admin());

create extension if not exists pgcrypto with schema extensions;

create or replace function public.crm_hash_password(user_password text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  hashed_password text;
begin
  if to_regprocedure('extensions.gen_salt(text)') is not null then
    execute 'select extensions.crypt($1, extensions.gen_salt(''bf''))'
    using user_password
    into hashed_password;
  elsif to_regprocedure('public.gen_salt(text)') is not null then
    execute 'select public.crypt($1, public.gen_salt(''bf''))'
    using user_password
    into hashed_password;
  else
    raise exception 'Extensao pgcrypto nao encontrada. Ative a extensao pgcrypto no Supabase.';
  end if;

  return hashed_password;
end;
$$;

create or replace function public.crm_log_action(
  action_name text,
  target_id uuid,
  target_email_value text,
  details_value jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_email_value text;
begin
  select email into actor_email_value
  from public.crm_profiles
  where id = auth.uid();

  insert into public.crm_audit_logs (actor_id, actor_email, action, target_user_id, target_email, details)
  values (auth.uid(), actor_email_value, action_name, target_id, target_email_value, coalesce(details_value, '{}'::jsonb));
end;
$$;

create or replace function public.crm_admin_create_user(
  user_email text,
  user_password text,
  user_role text default 'user'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_user_id uuid;
  normalized_email text := lower(trim(user_email));
  normalized_role text := case when user_role = 'admin' then 'admin' else 'user' end;
begin
  if not public.crm_is_admin() then
    raise exception 'Apenas administradores podem cadastrar usuarios.';
  end if;

  if length(coalesce(user_password, '')) < 6 then
    raise exception 'A senha deve ter pelo menos 6 caracteres.';
  end if;

  select id into new_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if new_user_id is null then
    new_user_id := gen_random_uuid();
    insert into auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      phone_change,
      phone_change_token,
      reauthentication_token
    )
    values (
      new_user_id,
      'authenticated',
      'authenticated',
      normalized_email,
      public.crm_hash_password(user_password),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    );
  end if;

  insert into public.crm_profiles (id, email, role, blocked, updated_at)
  values (new_user_id, normalized_email, normalized_role, false, now())
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role,
      blocked = false,
      updated_at = now();

  perform public.crm_log_action(
    'usuario_criado',
    new_user_id,
    normalized_email,
    jsonb_build_object('role', normalized_role)
  );

  return new_user_id;
end;
$$;

create or replace function public.crm_admin_update_user(
  target_user_id uuid,
  user_email text,
  user_role text,
  user_blocked boolean
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(trim(user_email));
  normalized_role text := case when user_role = 'admin' then 'admin' else 'user' end;
begin
  if not public.crm_is_admin() then
    raise exception 'Apenas administradores podem editar usuarios.';
  end if;

  if target_user_id = auth.uid() and coalesce(user_blocked, false) then
    raise exception 'Voce nao pode bloquear o proprio usuario.';
  end if;

  update auth.users
  set email = normalized_email,
      banned_until = case when coalesce(user_blocked, false) then 'infinity'::timestamptz else null end,
      updated_at = now()
  where id = target_user_id;

  update auth.identities
  set identity_data = coalesce(identity_data, '{}'::jsonb) || jsonb_build_object('email', normalized_email, 'email_verified', true),
      updated_at = now()
  where user_id = target_user_id
    and provider = 'email';

  insert into public.crm_profiles (id, email, role, blocked, updated_at)
  values (target_user_id, normalized_email, normalized_role, coalesce(user_blocked, false), now())
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role,
      blocked = excluded.blocked,
      updated_at = now();

  perform public.crm_log_action(
    'usuario_editado',
    target_user_id,
    normalized_email,
    jsonb_build_object('role', normalized_role, 'blocked', coalesce(user_blocked, false))
  );
end;
$$;

create or replace function public.crm_admin_set_password(
  target_user_id uuid,
  user_password text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_email_value text;
begin
  if not public.crm_is_admin() then
    raise exception 'Apenas administradores podem alterar senhas.';
  end if;

  if length(coalesce(user_password, '')) < 6 then
    raise exception 'A senha deve ter pelo menos 6 caracteres.';
  end if;

  update auth.users
  set encrypted_password = public.crm_hash_password(user_password),
      updated_at = now()
  where id = target_user_id;

  select email into target_email_value
  from public.crm_profiles
  where id = target_user_id;

  perform public.crm_log_action(
    'senha_alterada',
    target_user_id,
    target_email_value,
    '{}'::jsonb
  );
end;
$$;

-- Para definir o primeiro administrador, rode uma vez no Supabase SQL Editor:
-- update public.crm_profiles set role = 'admin' where email = 'email@empresa.com';

-- Recarrega o cache do PostgREST para expor as funcoes RPC acima.
select pg_notify('pgrst', 'reload schema');
