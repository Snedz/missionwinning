-- Mission Coach: weekly plan + taster flag on profiles
alter table public.profiles add column if not exists coach_plan jsonb;
alter table public.profiles add column if not exists coach_taster_used boolean not null default false;
