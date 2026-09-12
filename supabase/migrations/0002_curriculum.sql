-- Zumi: shared curriculum catalogue — subjects, skills, difficulty levels,
-- activity templates, badges, and the child <-> subject priority join.

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  min_age int not null default 4,
  max_age int not null default 14,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (subject_id, code)
);

create index skills_subject_id_idx on public.skills (subject_id);

create table public.difficulty_levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  rank int not null unique
);

create table public.activity_templates (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  skill_id uuid references public.skills (id) on delete set null,
  activity_type text not null,
  name text not null,
  prompt_template text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index activity_templates_subject_id_idx on public.activity_templates (subject_id);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  icon text not null default 'star',
  criteria jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.child_learning_priorities (
  child_id uuid not null references public.children (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  priority int not null default 0,
  primary key (child_id, subject_id)
);
