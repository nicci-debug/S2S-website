-- Zumi: content — practice_sets, activities, questions, assignments.

create table public.practice_sets (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.parent_profiles (id) on delete cascade,
  child_id uuid references public.children (id) on delete cascade,
  subject_id uuid not null references public.subjects (id),
  title text not null,
  source_type text not null check (source_type in ('manual', 'ai', 'admin', 'upload')),
  source_input text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'assigned', 'archived')),
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

create index practice_sets_parent_id_idx on public.practice_sets (parent_id);
create index practice_sets_child_id_idx on public.practice_sets (child_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  practice_set_id uuid not null references public.practice_sets (id) on delete cascade,
  skill_id uuid references public.skills (id) on delete set null,
  type text not null check (type in (
    'multiple_choice', 'match_pairs', 'flash_cards', 'fill_in_the_blank',
    'spelling_input', 'true_false', 'unscramble_word', 'maths_answer',
    'translation', 'sentence_building'
  )),
  title text not null,
  instructions text,
  difficulty_level_id uuid references public.difficulty_levels (id),
  sort_order int not null default 0
);

create index activities_practice_set_id_idx on public.activities (practice_set_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  data jsonb not null,
  sort_order int not null default 0
);

create index questions_activity_id_idx on public.questions (activity_id);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  practice_set_id uuid not null references public.practice_sets (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  assigned_by uuid references public.parent_profiles (id),
  assigned_at timestamptz not null default now(),
  due_date date,
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed')),
  completed_at timestamptz
);

create index assignments_child_id_idx on public.assignments (child_id);
create index assignments_practice_set_id_idx on public.assignments (practice_set_id);
