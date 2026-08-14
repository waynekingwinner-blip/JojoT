-- v1.1 社交层:挑战参与 · 每日打卡 · 好友(库内版本 20260814134207)
-- 铁律:所有表只外键 profiles.id,绝不引用 auth.users

alter table public.profiles
  add column if not exists share_lists boolean not null default true,
  add column if not exists invite_code text unique;

create or replace function public.gen_invite_code() returns text
language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (floor(random()*31)+1)::int, 1), '')
  from generate_series(1, 8)
$$;

update public.profiles set invite_code = public.gen_invite_code() where invite_code is null;

create or replace function public.set_invite_code() returns trigger
language plpgsql as $$
begin
  if new.invite_code is null then new.invite_code := public.gen_invite_code(); end if;
  return new;
end $$;
drop trigger if exists trg_invite_code on public.profiles;
create trigger trg_invite_code before insert on public.profiles
  for each row execute function public.set_invite_code();

create table public.participations (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  challenge_key  text not null,
  challenge_name text not null,
  total_days     int  not null check (total_days between 1 and 366),
  started_on     date not null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create unique index one_active_participation
  on public.participations (profile_id) where is_active;

create table public.day_entries (
  id               uuid primary key default gen_random_uuid(),
  participation_id uuid not null references public.participations(id) on delete cascade,
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  day_no           int  not null check (day_no >= 1),
  tasks            jsonb not null default '[]'::jsonb,
  water_ml         int  not null default 0 check (water_ml >= 0),
  steps            int  not null default 0 check (steps >= 0),
  updated_at       timestamptz not null default now(),
  unique (participation_id, day_no)
);
create index on public.day_entries (profile_id, day_no);

create table public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester    uuid not null references public.profiles(id) on delete cascade,
  addressee    uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','accepted')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (requester <> addressee),
  unique (requester, addressee)
);
create index on public.friendships (addressee, status);

alter table public.participations enable row level security;
alter table public.day_entries    enable row level security;
alter table public.friendships    enable row level security;

create or replace function public.is_friend(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from friendships
    where status = 'accepted'
      and ((requester = public.current_profile_id() and addressee = p)
        or (addressee = public.current_profile_id() and requester = p)))
$$;

create policy "own participations" on public.participations
  for all using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
create policy "friends read participations" on public.participations
  for select using (
    public.is_friend(profile_id)
    and exists (select 1 from public.profiles pr
                where pr.id = profile_id and pr.share_lists));

create policy "own day entries" on public.day_entries
  for all using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
create policy "friends read day entries" on public.day_entries
  for select using (
    public.is_friend(profile_id)
    and exists (select 1 from public.profiles pr
                where pr.id = profile_id and pr.share_lists));

create policy "see own friendships" on public.friendships
  for select using (requester = public.current_profile_id()
                 or addressee = public.current_profile_id());
create policy "send request" on public.friendships
  for insert with check (requester = public.current_profile_id() and status = 'pending');
create policy "respond to request" on public.friendships
  for update using (addressee = public.current_profile_id())
  with check (addressee = public.current_profile_id());
create policy "remove friendship" on public.friendships
  for delete using (requester = public.current_profile_id()
                 or addressee = public.current_profile_id());

create policy "friends read profiles" on public.profiles
  for select using (public.is_friend(id));

create or replace function public.request_friend_by_code(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_target uuid; v_me uuid := public.current_profile_id();
begin
  if v_me is null then raise exception 'not signed in'; end if;
  select id into v_target from profiles where invite_code = upper(trim(p_code));
  if v_target is null then raise exception 'invite code not found'; end if;
  if v_target = v_me then raise exception 'cannot friend yourself'; end if;
  insert into friendships (requester, addressee) values (v_me, v_target)
    on conflict (requester, addressee) do nothing;
  return v_target;
end $$;
revoke all on function public.request_friend_by_code from public;
grant execute on function public.request_friend_by_code to authenticated;

alter publication supabase_realtime add table public.day_entries;
alter publication supabase_realtime add table public.friendships;
