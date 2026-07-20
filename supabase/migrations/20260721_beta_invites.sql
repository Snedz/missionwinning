-- Wave 10: beta invite codes + profiles.invited_via (attribution, service-role writes only)

create table if not exists public.beta_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  email text,
  created_at timestamptz not null default now(),
  first_landed_at timestamptz,
  signed_up_user_id uuid references auth.users (id) on delete set null,
  day2_sent_at timestamptz,
  day7_sent_at timestamptz,
  notes text
);

create unique index if not exists beta_invites_code_uidx
  on public.beta_invites (code);

create index if not exists beta_invites_email_idx
  on public.beta_invites (email)
  where email is not null;

create index if not exists beta_invites_signed_up_idx
  on public.beta_invites (signed_up_user_id)
  where signed_up_user_id is not null;

alter table public.beta_invites enable row level security;
-- No policies: service_role only (bypasses RLS). Anon/authenticated have no access.

alter table public.profiles add column if not exists invited_via text;

create index if not exists profiles_invited_via_idx
  on public.profiles (invited_via)
  where invited_via is not null;

-- Prevent clients from spoofing invited_via (same pattern as referral cols).
create or replace function public.profiles_protect_invite_cols()
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
    new.invited_via := old.invited_via;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_invite_cols on public.profiles;
create trigger profiles_protect_invite_cols
  before update on public.profiles
  for each row
  execute function public.profiles_protect_invite_cols();

-- Checkout recovery (Wave 10 B3) — abandoned Stripe sessions; service-role only.
create table if not exists public.checkout_recovery (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  email text not null,
  plan text,
  expired_at timestamptz not null default now(),
  recovery_sent_at timestamptz
);

create unique index if not exists checkout_recovery_session_uidx
  on public.checkout_recovery (session_id);

create index if not exists checkout_recovery_send_idx
  on public.checkout_recovery (expired_at)
  where recovery_sent_at is null;

alter table public.checkout_recovery enable row level security;
-- No policies: service_role only.
