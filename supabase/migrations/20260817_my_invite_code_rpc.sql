-- Fetch your own invite code without the client knowing its profile id.
-- security definer but pinned to current_profile_id(), so it can only
-- ever return the caller's own code.
create or replace function public.my_invite_code() returns text
language sql stable security definer set search_path = public
as $$ select invite_code from public.profiles where id = public.current_profile_id() $$;
revoke all on function public.my_invite_code() from public, anon;
grant execute on function public.my_invite_code() to authenticated;
