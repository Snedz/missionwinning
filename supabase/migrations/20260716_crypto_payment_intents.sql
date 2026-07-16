-- Phantom / Solana USDC lifetime checkout intents (service-role only).
-- Matching uses Solana Pay reference_pubkey; confirm sets tx_signature then enrollments.

create table if not exists public.crypto_payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  reference_pubkey text not null,
  amount_usdc numeric(12, 2) not null default 149.00,
  amount_micro bigint not null default 149000000,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'expired')),
  tx_signature text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create unique index if not exists crypto_payment_intents_reference_uidx
  on public.crypto_payment_intents (reference_pubkey);

create unique index if not exists crypto_payment_intents_tx_signature_uidx
  on public.crypto_payment_intents (tx_signature)
  where tx_signature is not null;

create index if not exists crypto_payment_intents_user_id_idx
  on public.crypto_payment_intents (user_id);

create index if not exists crypto_payment_intents_status_expires_idx
  on public.crypto_payment_intents (status, expires_at);

alter table public.crypto_payment_intents enable row level security;

-- No anon/authenticated policies: only service role (webhooks / API) writes.
-- Users may read their own intents for support/debug.
drop policy if exists "Users read own crypto payment intents" on public.crypto_payment_intents;
create policy "Users read own crypto payment intents"
  on public.crypto_payment_intents for select
  using (auth.uid() = user_id);
