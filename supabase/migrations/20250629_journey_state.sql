-- F3: Journey state + profile prefs for cloud sync
alter table public.profiles
  add column if not exists journey_state jsonb,
  add column if not exists ui_mode text default 'simple',
  add column if not exists experience text,
  add column if not exists primary_goal text;

comment on column public.profiles.journey_state is 'Mission journey phases, milestones, commissionedAt (merged on sign-in)';
comment on column public.profiles.ui_mode is 'simple | pro';
