-- School classes + Presidential Fitness Test cloud results (Phase 2)

create table if not exists public.school_classes (
  code text primary key,
  name text not null default 'PE Class',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.fitness_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  class_code text references public.school_classes(code) on delete set null,
  overall_tier text not null,
  age integer,
  session jsonb not null default '{}',
  completed_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists fitness_test_results_class_idx
  on public.fitness_test_results(class_code);
create index if not exists fitness_test_results_completed_idx
  on public.fitness_test_results(completed_at desc);

alter table public.school_classes enable row level security;
alter table public.fitness_test_results enable row level security;

drop policy if exists "Anyone can read school class names" on public.school_classes;
create policy "Anyone can read school class names"
  on public.school_classes for select using (true);

drop policy if exists "Authenticated users create school classes" on public.school_classes;
create policy "Authenticated users create school classes"
  on public.school_classes for insert with check (auth.uid() is not null);

drop policy if exists "Creators update own school classes" on public.school_classes;
create policy "Creators update own school classes"
  on public.school_classes for update using (auth.uid() = created_by);

drop policy if exists "Users read own fitness test results" on public.fitness_test_results;
create policy "Users read own fitness test results"
  on public.fitness_test_results for select using (auth.uid() = user_id);

drop policy if exists "Users insert own fitness test results" on public.fitness_test_results;
create policy "Users insert own fitness test results"
  on public.fitness_test_results for insert with check (auth.uid() = user_id);
