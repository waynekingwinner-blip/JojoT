-- 身份基础:可移植身份层(King 于 2026-08-13 经 SQL Editor 手工执行)
-- 规则:业务数据永远只认 profiles.id;auth.users.id 只出现在 auth_links。

create table public.profiles (
  id               uuid primary key default gen_random_uuid(),
  auth_provider    text not null,
  provider_subject text not null,
  display_name     text,
  created_at       timestamptz not null default now(),
  unique (auth_provider, provider_subject)
);

create table public.auth_links (
  supabase_uid uuid primary key references auth.users(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade
);
create index on public.auth_links (profile_id);

alter table public.profiles  enable row level security;
alter table public.auth_links enable row level security;

create function public.current_profile_id() returns uuid
language sql stable security definer set search_path = public as $$
  select profile_id from auth_links where supabase_uid = auth.uid()
$$;

create policy "read own profile" on public.profiles
  for select using (id = public.current_profile_id());
create policy "update own profile" on public.profiles
  for update using (id = public.current_profile_id());

create function public.ensure_profile(p_provider text, p_subject text, p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_profile uuid;
begin
  select profile_id into v_profile from auth_links where supabase_uid = auth.uid();
  if v_profile is not null then return v_profile; end if;
  select id into v_profile from profiles
   where auth_provider = p_provider and provider_subject = p_subject;
  if v_profile is null then
    insert into profiles (auth_provider, provider_subject, display_name)
    values (p_provider, p_subject, p_name) returning id into v_profile;
  end if;
  insert into auth_links (supabase_uid, profile_id) values (auth.uid(), v_profile);
  return v_profile;
end $$;

revoke all on function public.ensure_profile from public;
grant execute on function public.ensure_profile to authenticated;
