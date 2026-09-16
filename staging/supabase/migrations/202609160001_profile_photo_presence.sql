-- Profile photos persisted server-side and user presence (last activity) for the user directory.
begin;

alter table public.vaak_profiles
  add column if not exists avatar_url text,
  add column if not exists last_seen_at timestamptz,
  add column if not exists signed_out_at timestamptz;

alter table public.vaak_profiles
  drop constraint if exists vaak_profiles_avatar_url_format;
alter table public.vaak_profiles
  add constraint vaak_profiles_avatar_url_format
  check (avatar_url is null or (avatar_url like 'data:image/%' and length(avatar_url) <= 700000));

commit;
