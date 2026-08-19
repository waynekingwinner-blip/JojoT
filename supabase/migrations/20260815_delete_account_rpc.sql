-- Mirror of the live delete_account RPC (was applied directly, never mirrored).
-- App Store 5.1.1(v): account-based apps must offer in-app account deletion.
create or replace function public.delete_account() returns void
language plpgsql security definer set search_path to 'public'
as $$
declare v_me uuid := public.current_profile_id();
        v_uid uuid := auth.uid();
begin
  if v_me is null then raise exception 'not signed in'; end if;
  -- 级联清掉 participations / day_entries / friendships / auth_links / reports(reporter 置空)
  delete from profiles where id = v_me;
  -- 登录凭证本体也删(孤儿 auth 用户不留)
  delete from auth.users where id = v_uid;
end $$;
