begin;

create extension if not exists pgcrypto;

do $$ begin
  create type public.vaak_app_role as enum ('admin','worker','client');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.vaak_membership_status as enum ('active','disabled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.vaak_objective_status as enum ('pending','in_progress','completed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.vaak_document_kind as enum ('purchase_order','report');
exception when duplicate_object then null; end $$;

create table if not exists public.vaak_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vaak_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Usuario VAAK',
  locale text not null default 'es' check (locale in ('es','en')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vaak_user_company_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.vaak_profiles(id) on delete cascade,
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  role public.vaak_app_role not null,
  status public.vaak_membership_status not null default 'active',
  created_at timestamptz not null default now(),
  unique(user_id, company_id)
);

create table if not exists public.vaak_projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  code text not null,
  name text not null,
  legal_name text,
  tax_id text,
  fiscal_address text,
  installation_date date,
  opening_date date,
  cover_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, code)
);

create table if not exists public.vaak_user_project_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.vaak_profiles(id) on delete cascade,
  project_id uuid not null references public.vaak_projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, project_id)
);

create table if not exists public.vaak_objectives (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid references public.vaak_projects(id) on delete cascade,
  title text not null,
  status public.vaak_objective_status not null default 'pending',
  due_date date,
  assigned_user_id uuid references public.vaak_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.vaak_project_warehouses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid not null references public.vaak_projects(id) on delete cascade,
  label text not null,
  address text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vaak_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid not null references public.vaak_projects(id) on delete cascade,
  po_number bigint generated always as identity unique,
  supplier text not null,
  issue_date date not null default current_date,
  currency text not null default 'PEN' check (currency in ('PEN','USD')),
  total numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  generated_by uuid not null references public.vaak_profiles(id),
  pdf_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.vaak_purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.vaak_purchase_orders(id) on delete cascade,
  item_number integer not null check (item_number > 0),
  description text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_cost numeric(14,2) not null check (unit_cost >= 0),
  unique(purchase_order_id, item_number)
);

create table if not exists public.vaak_specs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid references public.vaak_projects(id) on delete set null,
  item_code text not null,
  name text not null,
  category text,
  vendor text,
  currency text not null default 'USD' check (currency in ('PEN','USD')),
  cost numeric(14,2) not null default 0,
  image_path text,
  pdf_path text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(company_id, item_code)
);

create table if not exists public.vaak_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid not null references public.vaak_projects(id) on delete cascade,
  title text not null,
  report_date date not null default current_date,
  file_path text,
  created_by uuid not null references public.vaak_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.vaak_client_document_grants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid not null references public.vaak_projects(id) on delete cascade,
  client_user_id uuid not null references public.vaak_profiles(id) on delete cascade,
  document_kind public.vaak_document_kind not null,
  document_id uuid not null,
  granted_by uuid not null references public.vaak_profiles(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(client_user_id, document_kind, document_id)
);

create table if not exists public.vaak_public_tracking_tokens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid not null references public.vaak_projects(id) on delete cascade,
  purchase_order_id uuid references public.vaak_purchase_orders(id) on delete cascade,
  token_hash text not null unique,
  public_status text not null,
  public_message text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vaak_stored_objects_ledger (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  project_id uuid references public.vaak_projects(id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  checksum text,
  uploaded_by uuid references public.vaak_profiles(id),
  created_at timestamptz not null default now(),
  unique(bucket_id, object_path)
);

create table if not exists public.vaak_audit_events (
  id bigint generated always as identity primary key,
  company_id uuid references public.vaak_companies(id) on delete set null,
  actor_user_id uuid references public.vaak_profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.vaak_validate_client_document_grant()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.document_kind = 'purchase_order' and not exists(
    select 1 from public.vaak_purchase_orders po where po.id=new.document_id and po.company_id=new.company_id and po.project_id=new.project_id
  ) then raise exception 'purchase_order grant target does not match company/project'; end if;
  if new.document_kind = 'report' and not exists(
    select 1 from public.vaak_reports r where r.id=new.document_id and r.company_id=new.company_id and r.project_id=new.project_id
  ) then raise exception 'report grant target does not match company/project'; end if;
  return new;
end; $$;

drop trigger if exists vaak_validate_client_document_grant on public.vaak_client_document_grants;
create trigger vaak_validate_client_document_grant before insert or update on public.vaak_client_document_grants for each row execute procedure public.vaak_validate_client_document_grant();

create or replace function public.vaak_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.vaak_profiles(id, display_name, locale)
  values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), 'es')
  on conflict (id) do nothing;
  return new;
end; $$;

create or replace function public.vaak_is_company_admin(target_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.vaak_user_company_memberships m where m.user_id = auth.uid() and m.company_id = target_company and m.role = 'admin' and m.status = 'active');
$$;

create or replace function public.vaak_has_company_access(target_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.vaak_user_company_memberships m where m.user_id = auth.uid() and m.company_id = target_company and m.status = 'active');
$$;

create or replace function public.vaak_has_project_access(target_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.vaak_projects p
    join public.vaak_user_company_memberships cm on cm.company_id = p.company_id and cm.user_id = auth.uid() and cm.status = 'active'
    where p.id = target_project and (cm.role = 'admin' or exists(select 1 from public.vaak_user_project_memberships pm where pm.user_id = auth.uid() and pm.project_id = p.id))
  );
$$;

create or replace function public.vaak_is_internal_company_member(target_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.vaak_user_company_memberships m
    where m.user_id = auth.uid() and m.company_id = target_company
      and m.role in ('admin','worker') and m.status = 'active'
  );
$$;

create or replace function public.vaak_can_read_storage_object(target_bucket text, object_name text)
returns boolean language plpgsql stable security definer set search_path = public, storage as $$
declare
  parts text[] := string_to_array(object_name, '/');
  object_company uuid;
  object_project uuid;
  object_document uuid;
begin
  if array_length(parts, 1) < 3 then return false; end if;
  object_company := parts[1]::uuid;
  object_project := parts[2]::uuid;
  object_document := parts[3]::uuid;

  if not public.vaak_has_project_access(object_project) then return false; end if;
  if target_bucket = 'vaak-stg-project-media' then return true; end if;
  if target_bucket = 'vaak-stg-spec-pdfs' then return public.vaak_is_internal_company_member(object_company); end if;
  if public.vaak_is_internal_company_member(object_company) then return true; end if;
  if target_bucket = 'vaak-stg-po-pdfs' then
    return exists(select 1 from public.vaak_client_document_grants g where g.client_user_id=auth.uid() and g.company_id=object_company and g.project_id=object_project and g.document_kind='purchase_order' and g.document_id=object_document and g.revoked_at is null);
  end if;
  if target_bucket = 'vaak-stg-report-exports' then
    return exists(select 1 from public.vaak_client_document_grants g where g.client_user_id=auth.uid() and g.company_id=object_company and g.project_id=object_project and g.document_kind='report' and g.document_id=object_document and g.revoked_at is null);
  end if;
  return false;
exception when invalid_text_representation then
  return false;
end; $$;

create or replace function public.vaak_lookup_public_tracking(raw_token text)
returns table(public_status text, public_message text) language sql security definer set search_path = public as $$
  select t.public_status, t.public_message from public.vaak_public_tracking_tokens t
  where t.token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex') and t.revoked_at is null and t.expires_at > now()
  limit 1;
$$;
revoke all on function public.vaak_lookup_public_tracking(text) from public;
grant execute on function public.vaak_lookup_public_tracking(text) to anon, authenticated;

alter table public.vaak_companies enable row level security;
alter table public.vaak_profiles enable row level security;
alter table public.vaak_user_company_memberships enable row level security;
alter table public.vaak_projects enable row level security;
alter table public.vaak_user_project_memberships enable row level security;
alter table public.vaak_objectives enable row level security;
alter table public.vaak_project_warehouses enable row level security;
alter table public.vaak_purchase_orders enable row level security;
alter table public.vaak_purchase_order_items enable row level security;
alter table public.vaak_specs enable row level security;
alter table public.vaak_reports enable row level security;
alter table public.vaak_client_document_grants enable row level security;
alter table public.vaak_public_tracking_tokens enable row level security;
alter table public.vaak_stored_objects_ledger enable row level security;
alter table public.vaak_audit_events enable row level security;

create policy "profiles_read_self_or_company_admin" on public.vaak_profiles for select to authenticated using (
  id = auth.uid() or exists(select 1 from public.vaak_user_company_memberships target join public.vaak_user_company_memberships actor on actor.company_id = target.company_id where target.user_id = vaak_profiles.id and actor.user_id = auth.uid() and actor.role = 'admin' and actor.status = 'active')
);
create policy "companies_read_member" on public.vaak_companies for select to authenticated using (public.vaak_has_company_access(id));
create policy "memberships_read_self_or_admin" on public.vaak_user_company_memberships for select to authenticated using (user_id = auth.uid() or public.vaak_is_company_admin(company_id));
create policy "memberships_admin_write" on public.vaak_user_company_memberships for all to authenticated using (public.vaak_is_company_admin(company_id)) with check (public.vaak_is_company_admin(company_id));
create policy "projects_read_scoped" on public.vaak_projects for select to authenticated using (public.vaak_has_project_access(id));
create policy "projects_admin_write" on public.vaak_projects for all to authenticated using (public.vaak_is_company_admin(company_id)) with check (public.vaak_is_company_admin(company_id));
create policy "project_memberships_read_scoped" on public.vaak_user_project_memberships for select to authenticated using (user_id = auth.uid() or public.vaak_has_project_access(project_id));
create policy "project_memberships_admin_write" on public.vaak_user_project_memberships for all to authenticated using (exists(select 1 from public.vaak_projects p where p.id = project_id and public.vaak_is_company_admin(p.company_id))) with check (exists(select 1 from public.vaak_projects p where p.id = project_id and public.vaak_is_company_admin(p.company_id)));
create policy "objectives_read_scoped" on public.vaak_objectives for select to authenticated using (public.vaak_is_internal_company_member(company_id) and (project_id is null or public.vaak_has_project_access(project_id)));
create policy "objectives_admin_write" on public.vaak_objectives for all to authenticated using (public.vaak_is_company_admin(company_id)) with check (public.vaak_is_company_admin(company_id));
create policy "warehouses_internal_read" on public.vaak_project_warehouses for select to authenticated using (public.vaak_is_internal_company_member(company_id) and public.vaak_has_project_access(project_id));
create policy "warehouses_internal_write" on public.vaak_project_warehouses for all to authenticated using (public.vaak_is_internal_company_member(company_id) and public.vaak_has_project_access(project_id)) with check (public.vaak_is_internal_company_member(company_id) and public.vaak_has_project_access(project_id));
create policy "po_internal_read" on public.vaak_purchase_orders for select to authenticated using (public.vaak_has_project_access(project_id) or exists(select 1 from public.vaak_client_document_grants g where g.client_user_id=auth.uid() and g.document_kind='purchase_order' and g.document_id=vaak_purchase_orders.id and g.revoked_at is null));
create policy "po_internal_write" on public.vaak_purchase_orders for all to authenticated using (public.vaak_has_project_access(project_id) and exists(select 1 from public.vaak_user_company_memberships m where m.user_id=auth.uid() and m.company_id=vaak_purchase_orders.company_id and m.role in ('admin','worker') and m.status='active')) with check (public.vaak_has_project_access(project_id) and generated_by=auth.uid());
create policy "po_items_scoped" on public.vaak_purchase_order_items for select to authenticated using (exists(select 1 from public.vaak_purchase_orders po where po.id=purchase_order_id and (public.vaak_has_project_access(po.project_id) or exists(select 1 from public.vaak_client_document_grants g where g.client_user_id=auth.uid() and g.document_kind='purchase_order' and g.document_id=po.id and g.revoked_at is null))));
create policy "po_items_internal_write" on public.vaak_purchase_order_items for all to authenticated using (exists(select 1 from public.vaak_purchase_orders po where po.id=purchase_order_id and public.vaak_is_internal_company_member(po.company_id) and public.vaak_has_project_access(po.project_id))) with check (exists(select 1 from public.vaak_purchase_orders po where po.id=purchase_order_id and public.vaak_is_internal_company_member(po.company_id) and public.vaak_has_project_access(po.project_id)));
create policy "specs_internal_read" on public.vaak_specs for select to authenticated using (public.vaak_is_internal_company_member(company_id) and (project_id is null or public.vaak_has_project_access(project_id)));
create policy "specs_internal_write" on public.vaak_specs for all to authenticated using (public.vaak_is_internal_company_member(company_id) and (project_id is null or public.vaak_has_project_access(project_id))) with check (public.vaak_is_internal_company_member(company_id) and (project_id is null or public.vaak_has_project_access(project_id)));
create policy "reports_scoped_read" on public.vaak_reports for select to authenticated using (
  (public.vaak_is_internal_company_member(company_id) and public.vaak_has_project_access(project_id))
  or exists(select 1 from public.vaak_client_document_grants g where g.client_user_id=auth.uid() and g.document_kind='report' and g.document_id=vaak_reports.id and g.revoked_at is null)
);
create policy "reports_internal_write" on public.vaak_reports for all to authenticated using (public.vaak_is_internal_company_member(company_id) and public.vaak_has_project_access(project_id)) with check (public.vaak_is_internal_company_member(company_id) and public.vaak_has_project_access(project_id) and created_by=auth.uid());
create policy "grants_client_or_admin_read" on public.vaak_client_document_grants for select to authenticated using (client_user_id=auth.uid() or public.vaak_is_company_admin(company_id));
create policy "grants_admin_write" on public.vaak_client_document_grants for all to authenticated using (public.vaak_is_company_admin(company_id)) with check (public.vaak_is_company_admin(company_id));
create policy "tracking_admin_only" on public.vaak_public_tracking_tokens for all to authenticated using (public.vaak_is_company_admin(company_id)) with check (public.vaak_is_company_admin(company_id));
create policy "ledger_project_read" on public.vaak_stored_objects_ledger for select to authenticated using (public.vaak_has_company_access(company_id) and (project_id is null or public.vaak_has_project_access(project_id)));
create policy "ledger_internal_write" on public.vaak_stored_objects_ledger for all to authenticated using (public.vaak_has_project_access(project_id)) with check (public.vaak_has_project_access(project_id));
create policy "audit_admin_read" on public.vaak_audit_events for select to authenticated using (public.vaak_is_company_admin(company_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('vaak-stg-project-media','vaak-stg-project-media',false,10485760,array['image/jpeg','image/png','image/webp']),
('vaak-stg-spec-pdfs','vaak-stg-spec-pdfs',false,20971520,array['application/pdf']),
('vaak-stg-po-pdfs','vaak-stg-po-pdfs',false,20971520,array['application/pdf']),
('vaak-stg-report-exports','vaak-stg-report-exports',false,20971520,array['application/pdf','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
('vaak-stg-seed-assets','vaak-stg-seed-assets',false,20971520,null),
('vaak-stg-storage-exports','vaak-stg-storage-exports',false,104857600,null)
on conflict (id) do update set public=false;

create policy "storage_read_scoped" on storage.objects for select to authenticated using (
  bucket_id in ('vaak-stg-project-media','vaak-stg-spec-pdfs','vaak-stg-po-pdfs','vaak-stg-report-exports')
  and public.vaak_can_read_storage_object(bucket_id, name)
);
create policy "storage_internal_insert" on storage.objects for insert to authenticated with check (
  bucket_id in ('vaak-stg-project-media','vaak-stg-spec-pdfs','vaak-stg-po-pdfs','vaak-stg-report-exports')
  and public.vaak_is_internal_company_member(((storage.foldername(name))[1])::uuid)
  and public.vaak_has_project_access(((storage.foldername(name))[2])::uuid)
);
create policy "storage_internal_update" on storage.objects for update to authenticated using (
  bucket_id in ('vaak-stg-project-media','vaak-stg-spec-pdfs','vaak-stg-po-pdfs','vaak-stg-report-exports')
  and public.vaak_is_internal_company_member(((storage.foldername(name))[1])::uuid)
  and public.vaak_has_project_access(((storage.foldername(name))[2])::uuid)
) with check (public.vaak_is_internal_company_member(((storage.foldername(name))[1])::uuid) and public.vaak_has_project_access(((storage.foldername(name))[2])::uuid));
create policy "storage_admin_delete" on storage.objects for delete to authenticated using (public.vaak_is_company_admin(((storage.foldername(name))[1])::uuid));

commit;
