-- Founder ratings on tester notes (.778).
-- leads stays the write-once log. This table is loop state (class + dest).
-- Agents write this file; founder applies (CoS). Inbox still reads if missing.

create table if not exists public.feedback_reviews (
  lead_id bigint primary key references public.leads (id) on delete cascade,
  class text not null
    check (class in (
      'wedge-bug',
      'wedge-confusion',
      'voice',
      'planner',
      'feature-ask',
      'off-horizon',
      'medical-legal',
      'abuse-spam'
    )),
  dest text not null
    check (dest in ('craft', 'voice', 'park', 'done')),
  reasons text[] not null default '{}',
  decided_at timestamptz not null default now(),
  decided_by text not null
    check (char_length(decided_by) > 0 and char_length(decided_by) <= 320)
);

alter table public.feedback_reviews enable row level security;
