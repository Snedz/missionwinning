-- Mission Server durable rooms (.776).
-- Signed-in athletes share train / garage / off-topic. Guests stay local.
-- Agents write this file; founder applies (CoS). Runtime fail-opens if missing.

create table if not exists public.social_messages (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  channel_slug text not null
    check (channel_slug in ('train', 'garage', 'off-topic')),
  body text not null
    check (char_length(body) > 0 and char_length(body) <= 2000),
  kind text not null default 'text'
    check (kind in ('text', 'nudge')),
  author_call_sign text not null
    check (char_length(author_call_sign) > 0 and char_length(author_call_sign) <= 24),
  author_mission_id text
    check (author_mission_id is null or author_mission_id ~ '^[0-9]{2}$'),
  created_at timestamptz not null
);

create index if not exists social_messages_channel_created_idx
  on public.social_messages (channel_slug, created_at);

create table if not exists public.social_presence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null
    check (status in ('available', 'away', 'offline')),
  call_sign text not null default 'Athlete'
    check (char_length(call_sign) > 0 and char_length(call_sign) <= 24),
  last_seen timestamptz not null default now()
);

create table if not exists public.social_message_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message_id text not null,
  reason text not null default 'other'
    check (reason in ('spam', 'abuse', 'other')),
  created_at timestamptz not null default now(),
  unique (user_id, message_id)
);

alter table public.social_messages enable row level security;
alter table public.social_presence enable row level security;
alter table public.social_message_reports enable row level security;

drop policy if exists "authenticated read garage messages" on public.social_messages;
create policy "authenticated read garage messages"
  on public.social_messages for select
  to authenticated
  using (channel_slug in ('train', 'garage', 'off-topic'));

drop policy if exists "authenticated insert own garage messages" on public.social_messages;
create policy "authenticated insert own garage messages"
  on public.social_messages for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and channel_slug in ('train', 'garage', 'off-topic')
  );

drop policy if exists "authenticated read garage presence" on public.social_presence;
create policy "authenticated read garage presence"
  on public.social_presence for select
  to authenticated
  using (true);

drop policy if exists "authenticated upsert own presence" on public.social_presence;
create policy "authenticated upsert own presence"
  on public.social_presence for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "authenticated update own presence" on public.social_presence;
create policy "authenticated update own presence"
  on public.social_presence for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "authenticated insert own message reports" on public.social_message_reports;
create policy "authenticated insert own message reports"
  on public.social_message_reports for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "authenticated read own message reports" on public.social_message_reports;
create policy "authenticated read own message reports"
  on public.social_message_reports for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on table public.social_messages from public, anon;
revoke all on table public.social_presence from public, anon;
revoke all on table public.social_message_reports from public, anon;

grant select, insert on table public.social_messages to authenticated;
grant select, insert, update on table public.social_presence to authenticated;
grant select, insert on table public.social_message_reports to authenticated;

alter table public.social_messages replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'social_messages'
     ) then
    alter publication supabase_realtime add table public.social_messages;
  end if;
end $$;

comment on table public.social_messages is
  'Signed-in Mission Server rooms. Guests stay local. No workout logs.';
comment on table public.social_presence is
  'Self-declared presence for signed-in Garage members. Never invent other dots.';
comment on table public.social_message_reports is
  'Athlete-filed reports on another Garage message. First shared-text moderation surface.';
