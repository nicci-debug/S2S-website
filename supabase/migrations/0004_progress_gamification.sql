-- Zumi: progress tracking and gamification — attempts, child_skill_progress,
-- xp_events, streaks, child_badges.

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  assignment_id uuid references public.assignments (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  skill_id uuid references public.skills (id),
  given_answer jsonb,
  is_correct boolean not null,
  time_taken_ms int,
  attempted_at timestamptz not null default now()
);

create index attempts_child_id_idx on public.attempts (child_id);
create index attempts_assignment_id_idx on public.attempts (assignment_id);

create table public.child_skill_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  attempts_count int not null default 0,
  correct_count int not null default 0,
  incorrect_count int not null default 0,
  accuracy numeric(5, 2) not null default 0,
  mastery_score numeric(5, 2) not null default 0,
  review_step int not null default 0,
  last_practised_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (child_id, skill_id)
);

create index child_skill_progress_child_id_idx on public.child_skill_progress (child_id);
create index child_skill_progress_next_review_idx on public.child_skill_progress (next_review_at);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  amount int not null,
  reason text not null,
  related_assignment_id uuid references public.assignments (id) on delete set null,
  created_at timestamptz not null default now()
);

create index xp_events_child_id_idx on public.xp_events (child_id);

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique references public.children (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  used_freeze_at date
);

create table public.child_badges (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (child_id, badge_id)
);

create index child_badges_child_id_idx on public.child_badges (child_id);
