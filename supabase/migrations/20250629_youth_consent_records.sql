-- Verified parent consent for athletes under 13 (server persistence when signed in)

create table if not exists public.youth_consent_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_email text not null,
  child_age integer not null check (child_age > 0 and child_age < 13),
  verified_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists youth_consent_verified_idx
  on public.youth_consent_records(verified_at desc);

alter table public.youth_consent_records enable row level security;

drop policy if exists "Users read own youth consent" on public.youth_consent_records;
create policy "Users read own youth consent"
  on public.youth_consent_records for select using (auth.uid() = user_id);
