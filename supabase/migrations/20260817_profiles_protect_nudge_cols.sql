-- Freeze the daily-nudge mailbox columns on owner UPDATE.
-- profiles.email is client-writable under "Users update own profile"; the cron
-- used to Resend-send to that address. created_at / last_nudge_at gate week-1
-- recap and the 44h cooldown — a client must not rewrite those either.
-- service_role still writes last_nudge_at (markNudged).

create or replace function public.profiles_protect_nudge_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.email := old.email;
    new.created_at := old.created_at;
    new.last_nudge_at := old.last_nudge_at;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_nudge_cols on public.profiles;
create trigger profiles_protect_nudge_cols
  before update on public.profiles
  for each row
  execute function public.profiles_protect_nudge_cols();
