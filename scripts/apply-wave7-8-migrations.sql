-- Web push subscriptions (Wave 7) — owner RLS; service role for cron send.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  last_push_at timestamptz,
  unique (endpoint)
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "push_subscriptions_update_own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
-- Wave 8: referral codes + week-4 retention RPC
-- referred_by stores the referrer's code string (not UUID). Recognition-only rewards.

alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists referred_by text;

create unique index if not exists profiles_referral_code_uidx
  on public.profiles (referral_code)
  where referral_code is not null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

-- Prevent clients from spoofing referral_code / referred_by (RLS allows owner update).
create or replace function public.profiles_protect_referral_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- service_role bypasses; authenticated/anon cannot change these columns
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.referral_code := old.referral_code;
    new.referred_by := old.referred_by;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_referral_cols on public.profiles;
create trigger profiles_protect_referral_cols
  before update on public.profiles
  for each row
  execute function public.profiles_protect_referral_cols();

-- Week-4 retained weekly loggers (POST_LAUNCH_CADENCE.md)
create or replace function public.mw_week4_retention()
returns table (cohort_eligible bigint, week4_retained bigint)
language sql
security definer
set search_path = public
as $$
  with first_workout as (
    select user_id, min(completed_at) as first_at
    from workout_logs
    group by user_id
  ),
  week4 as (
    select f.user_id
    from first_workout f
    join workout_logs w on w.user_id = f.user_id
    where f.first_at < now() - interval '28 days'
      and w.completed_at >= f.first_at + interval '21 days'
      and w.completed_at < f.first_at + interval '28 days'
    group by f.user_id
  )
  select
    (select count(*)::bigint from first_workout where first_at < now() - interval '28 days'),
    (select count(*)::bigint from week4);
$$;

revoke all on function public.mw_week4_retention() from public;
revoke all on function public.mw_week4_retention() from anon, authenticated;
-- service_role retains execute by default via superuser paths
