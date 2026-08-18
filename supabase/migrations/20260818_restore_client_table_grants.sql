-- The hardening pass revoked ALL table privileges from the client role,
-- so every direct table operation (accept friend, push day, load friends)
-- died with permission denied while RPC-backed paths kept working.
-- Grant back the minimal set; RLS policies remain the row-level guard.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.friendships to authenticated;
grant select, insert, update on public.day_entries to authenticated;
grant select, insert, update on public.participations to authenticated;
grant select, insert on public.reports to authenticated;
-- auth_links stays locked: only security-definer RPCs may touch it.
