begin;

alter table public.vaak_profiles
  add column if not exists username text,
  add column if not exists login_email text,
  add column if not exists legacy_id text,
  add column if not exists team text,
  add column if not exists position text,
  add column if not exists phone text;

alter table public.vaak_user_company_memberships
  add column if not exists access jsonb not null default '{"version":2,"grants":{}}'::jsonb,
  add column if not exists project_scope text not null default 'selected'
    check (project_scope in ('selected','all')),
  add column if not exists local_project_ids text[] not null default '{}';

update public.vaak_profiles p
set login_email = lower(u.email),
    username = coalesce(
      nullif(trim(u.raw_user_meta_data->>'username'), ''),
      split_part(lower(u.email), '@', 1) || '-' || left(u.id::text, 6)
    ),
    legacy_id = coalesce(
      nullif(trim(u.raw_user_meta_data->>'legacy_id'), ''),
      'remote-' || u.id::text
    )
from auth.users u
where p.id = u.id
  and (p.login_email is null or p.username is null or p.legacy_id is null);

create unique index if not exists vaak_profiles_username_lower_uidx
  on public.vaak_profiles (lower(username)) where username is not null;
create unique index if not exists vaak_profiles_login_email_lower_uidx
  on public.vaak_profiles (lower(login_email)) where login_email is not null;
create unique index if not exists vaak_profiles_legacy_id_uidx
  on public.vaak_profiles (legacy_id) where legacy_id is not null;

create table if not exists public.vaak_user_provisioning (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  actor_user_id uuid not null references public.vaak_profiles(id),
  requested_username text not null,
  requested_email text not null,
  auth_user_id uuid references auth.users(id) on delete set null,
  state text not null default 'pending'
    check (state in ('pending','auth_created','completed','provisioning_failed','rolled_back','cleanup_required')),
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vaak_auth_rate_limits (
  attempt_key text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.vaak_user_provisioning enable row level security;
alter table public.vaak_auth_rate_limits enable row level security;

create or replace function public.vaak_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.vaak_profiles(id, display_name, locale, active)
  values(
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1), 'VAAK user'),
    case when new.raw_user_meta_data->>'locale' = 'es' then 'es' else 'en' end,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_vaak on auth.users;
create trigger on_auth_user_created_vaak
  after insert on auth.users
  for each row execute procedure public.vaak_handle_new_user();

create or replace function public.vaak_complete_user_provisioning(
  p_request_id uuid,
  p_auth_user_id uuid,
  p_display_name text,
  p_username text,
  p_login_email text,
  p_legacy_id text,
  p_role public.vaak_app_role,
  p_access jsonb,
  p_project_scope text,
  p_local_project_ids text[],
  p_team text,
  p_position text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_request public.vaak_user_provisioning%rowtype;
begin
  select * into v_request
  from public.vaak_user_provisioning
  where id = p_request_id
  for update;

  if not found then raise exception 'provisioning_request_not_found'; end if;
  if v_request.state = 'completed' then return; end if;
  if v_request.state not in ('pending','auth_created') then raise exception 'provisioning_request_not_resumable'; end if;
  if p_project_scope not in ('selected','all') then raise exception 'invalid_project_scope'; end if;

  insert into public.vaak_profiles(id, display_name, locale, active, username, login_email, legacy_id, team, position, phone)
  values(p_auth_user_id, trim(p_display_name), 'en', true, trim(p_username), lower(trim(p_login_email)), p_legacy_id, nullif(trim(p_team),''), nullif(trim(p_position),''), nullif(trim(p_phone),''))
  on conflict (id) do update set
    display_name = excluded.display_name,
    active = true,
    username = excluded.username,
    login_email = excluded.login_email,
    legacy_id = excluded.legacy_id,
    team = excluded.team,
    position = excluded.position,
    phone = excluded.phone,
    updated_at = now();

  insert into public.vaak_user_company_memberships(user_id, company_id, role, status, access, project_scope, local_project_ids)
  values(p_auth_user_id, v_request.company_id, p_role, 'active', coalesce(p_access,'{"version":2,"grants":{}}'::jsonb), p_project_scope, coalesce(p_local_project_ids,'{}'))
  on conflict (user_id, company_id) do update set
    role = excluded.role,
    status = 'active',
    access = excluded.access,
    project_scope = excluded.project_scope,
    local_project_ids = excluded.local_project_ids;

  update public.vaak_user_provisioning
  set auth_user_id = p_auth_user_id, state = 'completed', error_code = null, updated_at = now()
  where id = p_request_id;

  insert into public.vaak_audit_events(company_id, actor_user_id, action, resource_type, resource_id, metadata)
  values(v_request.company_id, v_request.actor_user_id, 'user.provisioned', 'user', p_auth_user_id::text,
    jsonb_build_object('idempotency_key', v_request.idempotency_key, 'role', p_role, 'username', lower(trim(p_username))));
end;
$$;

create or replace function public.vaak_check_login_rate_limit(
  p_attempt_key text,
  p_success boolean default false,
  p_limit integer default 8,
  p_window_seconds integer default 900,
  p_block_seconds integer default 900
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_row public.vaak_auth_rate_limits%rowtype;
  v_now timestamptz := now();
begin
  if p_success then
    delete from public.vaak_auth_rate_limits where attempt_key = p_attempt_key;
    return query select true, 0;
    return;
  end if;

  insert into public.vaak_auth_rate_limits(attempt_key, attempts, window_started_at, updated_at)
  values(p_attempt_key, 1, v_now, v_now)
  on conflict (attempt_key) do update set
    attempts = case
      when public.vaak_auth_rate_limits.window_started_at < v_now - make_interval(secs => p_window_seconds) then 1
      else public.vaak_auth_rate_limits.attempts + 1
    end,
    window_started_at = case
      when public.vaak_auth_rate_limits.window_started_at < v_now - make_interval(secs => p_window_seconds) then v_now
      else public.vaak_auth_rate_limits.window_started_at
    end,
    blocked_until = case
      when (case when public.vaak_auth_rate_limits.window_started_at < v_now - make_interval(secs => p_window_seconds) then 1 else public.vaak_auth_rate_limits.attempts + 1 end) > p_limit
        then v_now + make_interval(secs => p_block_seconds)
      else public.vaak_auth_rate_limits.blocked_until
    end,
    updated_at = v_now
  returning * into v_row;

  allowed := v_row.blocked_until is null or v_row.blocked_until <= v_now;
  retry_after_seconds := case when allowed then 0 else greatest(1, extract(epoch from (v_row.blocked_until - v_now))::integer) end;
  return next;
end;
$$;

create or replace function public.vaak_protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.role = 'admin' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'admin' or new.status <> 'active')
     and not exists (
       select 1 from public.vaak_user_company_memberships m
       where m.company_id = old.company_id and m.user_id <> old.user_id
         and m.role = 'admin' and m.status = 'active'
     ) then
    raise exception 'last_active_admin_required';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists vaak_protect_last_admin on public.vaak_user_company_memberships;
create trigger vaak_protect_last_admin
  before update or delete on public.vaak_user_company_memberships
  for each row execute procedure public.vaak_protect_last_admin();

revoke all on function public.vaak_complete_user_provisioning(uuid,uuid,text,text,text,text,public.vaak_app_role,jsonb,text,text[],text,text,text) from public, anon, authenticated;
grant execute on function public.vaak_complete_user_provisioning(uuid,uuid,text,text,text,text,public.vaak_app_role,jsonb,text,text[],text,text,text) to service_role;
revoke all on function public.vaak_check_login_rate_limit(text,boolean,integer,integer,integer) from public, anon, authenticated;
grant execute on function public.vaak_check_login_rate_limit(text,boolean,integer,integer,integer) to service_role;

commit;
