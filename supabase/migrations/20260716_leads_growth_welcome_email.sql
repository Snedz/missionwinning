-- Growth / waitlist attribution + lifecycle email stamps (idempotent).
-- Apply in Supabase SQL editor or CLI before relying on new columns in prod.

alter table public.leads add column if not exists utm jsonb;
alter table public.leads add column if not exists referrer text;
alter table public.leads add column if not exists confirmed_at timestamptz;
alter table public.leads add column if not exists launch_email_sent_at timestamptz;
alter table public.leads add column if not exists unsubscribed_at timestamptz;

create index if not exists leads_email_lower_idx on public.leads (lower(email));

alter table public.profiles add column if not exists welcome_email_sent_at timestamptz;
