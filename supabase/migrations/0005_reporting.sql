-- Zumi: weekly_reports.

create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  week_start date not null,
  week_end date not null,
  activities_completed int not null default 0,
  minutes_learned int not null default 0,
  accuracy numeric(5, 2) not null default 0,
  strongest_skill_id uuid references public.skills (id),
  weakest_skill_id uuid references public.skills (id),
  summary_text text not null,
  recommended_focus text,
  created_at timestamptz not null default now(),
  unique (child_id, week_start)
);

create index weekly_reports_child_id_idx on public.weekly_reports (child_id);
