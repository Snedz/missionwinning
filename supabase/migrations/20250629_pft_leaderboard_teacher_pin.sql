-- PFT scores on leaderboard + teacher PIN on school classes

alter table public.leaderboard_snapshots add column if not exists pft_score integer not null default 0;
alter table public.leaderboard_snapshots add column if not exists pft_tier text;

alter table public.school_classes add column if not exists teacher_pin text;

create index if not exists leaderboard_pft_score_idx
  on public.leaderboard_snapshots(pft_score desc);
