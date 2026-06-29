-- F3: Journey analytics events for beta funnel metrics
create table if not exists public.journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists journey_events_user_id_idx on public.journey_events(user_id);
create index if not exists journey_events_name_idx on public.journey_events(event_name);
create index if not exists journey_events_created_at_idx on public.journey_events(created_at desc);

alter table public.journey_events enable row level security;

create policy "Users read own journey events"
  on public.journey_events for select using (auth.uid() = user_id);

create policy "Users insert own journey events"
  on public.journey_events for insert with check (auth.uid() = user_id);
