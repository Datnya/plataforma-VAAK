-- Shared company workspace (projects, purchase orders, suppliers, specs, tasks, invoices and catalogs).
-- One JSON document per company with optimistic concurrency (revision), a rolling history for recovery
-- and a content-addressed image store. Accessed only through the service role from API routes.
begin;

create table if not exists public.vaak_company_data (
  company_id uuid primary key references public.vaak_companies(id) on delete cascade,
  state jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.vaak_company_data_history (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  revision bigint not null,
  state jsonb not null,
  updated_by uuid,
  saved_at timestamptz not null default now()
);
create index if not exists vaak_company_data_history_company_idx
  on public.vaak_company_data_history(company_id, id desc);

create table if not exists public.vaak_company_assets (
  company_id uuid not null references public.vaak_companies(id) on delete cascade,
  id text not null check (id ~ '^[0-9a-f]{64}$'),
  mime text not null check (mime in ('image/png','image/jpeg','image/webp','image/gif')),
  data_base64 text not null,
  byte_size integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  primary key (company_id, id)
);

alter table public.vaak_company_data enable row level security;
alter table public.vaak_company_data_history enable row level security;
alter table public.vaak_company_assets enable row level security;

create or replace function public.vaak_company_data_keep_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.vaak_company_data_history(company_id, revision, state, updated_by)
  values (old.company_id, old.revision, old.state, old.updated_by);
  delete from public.vaak_company_data_history
  where company_id = old.company_id
    and id not in (
      select id from public.vaak_company_data_history
      where company_id = old.company_id
      order by id desc
      limit 150
    );
  return new;
end;
$$;

drop trigger if exists vaak_company_data_history_trigger on public.vaak_company_data;
create trigger vaak_company_data_history_trigger
  before update on public.vaak_company_data
  for each row execute function public.vaak_company_data_keep_history();

revoke all on public.vaak_company_data, public.vaak_company_data_history, public.vaak_company_assets from anon, authenticated;
revoke all on function public.vaak_company_data_keep_history() from public, anon, authenticated;

commit;
