-- 安全收紧(库内版本 20260814134300)—— 按 Security Advisor 意见
alter function public.gen_invite_code() set search_path = public;
alter function public.set_invite_code() set search_path = public;

revoke execute on function public.current_profile_id() from public, anon;
grant  execute on function public.current_profile_id() to authenticated;

revoke execute on function public.is_friend(uuid) from public, anon;
grant  execute on function public.is_friend(uuid) to authenticated;

revoke execute on function public.gen_invite_code() from public, anon, authenticated;
revoke execute on function public.set_invite_code() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
