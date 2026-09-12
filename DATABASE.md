# Zumi — Database Design

Postgres via Supabase. All tables use `uuid` primary keys
(`default gen_random_uuid()`), `created_at timestamptz default now()`, and
(where mutable) `updated_at timestamptz default now()`. Migrations live in
`supabase/migrations/*.sql`, applied in filename order. Row Level Security
(RLS) is enabled on every table that holds parent- or child-scoped data.

## 1. Identity

### `users`
Mirrors `auth.users` 1:1 so we have a place to hang app-level fields
(role) without touching the `auth` schema. Created by a trigger on
`auth.users` insert.

| column     | type      | notes                                   |
|------------|-----------|------------------------------------------|
| id         | uuid PK   | = `auth.users.id`                        |
| email      | text      |                                           |
| role       | text      | `parent` \| `admin`, default `parent`    |
| created_at | timestamptz |                                         |

### `parent_profiles`
| column     | type    | notes |
|------------|---------|-------|
| id         | uuid PK |       |
| user_id    | uuid FK -> users(id), unique, not null |
| display_name | text | |
| locale     | text | BCP-47, default `en-ZA` |
| timezone   | text | IANA tz, default `Africa/Johannesburg` |
| created_at | timestamptz | |

### `children`
| column         | type    | notes |
|----------------|---------|-------|
| id             | uuid PK |
| parent_id      | uuid FK -> parent_profiles(id), not null, on delete cascade |
| name           | text, not null |
| age            | int, check 4–14 |
| grade          | text | e.g. `Grade 3` |
| home_language  | text | BCP-47, e.g. `en-ZA`, `af-ZA` |
| avatar_id      | text | references a static avatar catalogue key |
| total_xp       | int, not null, default 0 | cached aggregate; source of truth is `xp_events` |
| level          | int, not null, default 1 | derived from `total_xp`, cached for cheap reads |
| current_streak | int, not null, default 0 | cached; source of truth is `streaks` |
| longest_streak | int, not null, default 0 |
| created_at     | timestamptz |

`children.subjects`/`learning_priorities` are represented relationally via
`child_learning_priorities(child_id, subject_id, priority)` rather than an
array column, so they can be joined/filtered and constrained by FK.

### `child_learning_priorities`
| child_id (FK, PK part) | subject_id (FK, PK part) | priority int default 0 |

## 2. Curriculum catalogue (admin-managed, shared/global)

### `subjects`
`id, code (unique), name, description, sort_order, is_active`

### `skills`
`id, subject_id FK, code (unique per subject), name, description, min_age, max_age, is_active`
e.g. `Afrikaans vocabulary`, `Multiplication: 7 times table`.

### `difficulty_levels`
`id, code (unique), label, rank int` — e.g. `easy`(1) / `standard`(2) / `challenge`(3).
Admin-manageable lookup table rather than a hardcoded enum, per the admin
requirement to manage difficulty levels.

### `activity_templates`
Reusable AI-generation presets an admin can curate (e.g. "Afrikaans
spelling → flash cards + spelling input").
`id, subject_id FK, skill_id FK nullable, activity_type text, name, prompt_template text, is_active`

### `badges`
`id, code (unique), name, description, icon, criteria jsonb, is_active`
`criteria` example: `{"type": "streak", "days": 7}` or
`{"type": "skill_mastery", "skill_code": "afrikaans_vocab", "score": 90}`.
Interpreted by `lib/gamification.ts`, not by SQL.

## 3. Content (per-child or admin-authored)

### `practice_sets`
| column | type | notes |
|---|---|---|
| id | uuid PK |
| parent_id | uuid FK -> parent_profiles(id), nullable | null for admin-authored catalogue content |
| child_id | uuid FK -> children(id), nullable | set once assigned/created for a specific child |
| subject_id | uuid FK -> subjects(id), not null |
| title | text, not null |
| source_type | text | `manual` \| `ai` \| `admin` \| `upload` (reserved) |
| source_input | text | the raw parent-supplied text (spelling list, topic, instructions) |
| status | text | `draft` \| `ready` \| `assigned` \| `archived` |
| created_by | uuid FK -> users(id) |
| created_at | timestamptz |

### `activities`
| column | type | notes |
|---|---|---|
| id | uuid PK |
| practice_set_id | uuid FK -> practice_sets(id), on delete cascade |
| skill_id | uuid FK -> skills(id), nullable |
| type | text | one of the 10 activity-engine types (checked against `activity_type` enum) |
| title | text | |
| instructions | text | |
| difficulty_level_id | uuid FK -> difficulty_levels(id), nullable |
| sort_order | int, not null default 0 |

### `questions`
| column | type | notes |
|---|---|---|
| id | uuid PK |
| activity_id | uuid FK -> activities(id), on delete cascade |
| data | jsonb, not null | validated by the Zod schema for the parent activity's `type` |
| sort_order | int, not null default 0 |

`data` always carries the full structured payload for that activity type
(prompt/options/answer/etc — see ARCHITECTURE.md §3), so the activity engine
never needs a second query to render or grade a question.

### `assignments`
| column | type | notes |
|---|---|---|
| id | uuid PK |
| practice_set_id | uuid FK -> practice_sets(id) |
| child_id | uuid FK -> children(id) |
| assigned_by | uuid FK -> parent_profiles(id) |
| assigned_at | timestamptz default now() |
| due_date | date, nullable |
| status | text | `assigned` \| `in_progress` \| `completed` |
| completed_at | timestamptz, nullable |

## 4. Progress & attempts

### `attempts`
| column | type | notes |
|---|---|---|
| id | uuid PK |
| child_id | uuid FK -> children(id) |
| assignment_id | uuid FK -> assignments(id), nullable |
| activity_id | uuid FK -> activities(id) |
| question_id | uuid FK -> questions(id) |
| skill_id | uuid FK -> skills(id), nullable | denormalised for fast rollups |
| given_answer | jsonb |
| is_correct | boolean, not null |
| time_taken_ms | int |
| attempted_at | timestamptz default now() |

### `child_skill_progress`
| column | type | notes |
|---|---|---|
| id | uuid PK |
| child_id | uuid FK -> children(id) |
| skill_id | uuid FK -> skills(id) |
| attempts_count | int default 0 |
| correct_count | int default 0 |
| incorrect_count | int default 0 |
| accuracy | numeric(5,2) default 0 | `correct_count / attempts_count * 100` |
| mastery_score | numeric(5,2) default 0 | 0–100, see ARCHITECTURE.md §5 |
| review_step | int default 0 | spaced-repetition step index |
| last_practised_at | timestamptz, nullable |
| next_review_at | timestamptz, nullable |
| updated_at | timestamptz default now() |

`unique (child_id, skill_id)`.

## 5. Gamification

### `xp_events`
`id, child_id FK, amount int, reason text, related_assignment_id FK nullable, created_at`
Append-only ledger; `children.total_xp` is a cached sum kept in sync by the
server action that inserts events (a single transaction), not a trigger, to
keep the XP/level/badge-unlock logic in one place (`lib/gamification.ts`).

### `streaks`
`id, child_id FK unique, current_streak int, longest_streak int, last_activity_date date, used_freeze_at date nullable`

### `child_badges`
`id, child_id FK, badge_id FK, earned_at` — `unique (child_id, badge_id)`.

## 6. Reporting

### `weekly_reports`
`id, child_id FK, week_start date, week_end date, activities_completed int, minutes_learned int, accuracy numeric(5,2), strongest_skill_id FK nullable, weakest_skill_id FK nullable, summary_text text, recommended_focus text, created_at`
`unique (child_id, week_start)`.

## 7. Row Level Security

Enabled on every table below `parent_profiles`/`children` in the ownership
graph. Pattern used throughout (`children` shown, others follow the same
shape by joining up to `children`/`parent_profiles`):

```sql
create policy "parents manage their own children"
  on children for all
  using (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  )
  with check (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  );
```

For tables one join further from `parent_profiles` (e.g. `attempts`,
`assignments`, `child_skill_progress`), the policy resolves through
`children`:

```sql
using (
  child_id in (
    select c.id from children c
    join parent_profiles pp on pp.id = c.parent_id
    where pp.user_id = auth.uid()
  )
)
```

Admins get an additional permissive policy per table:
`using (exists (select 1 from users where id = auth.uid() and role = 'admin'))`,
so admin dashboards can read/write catalogue tables (`subjects`, `skills`,
`badges`, `difficulty_levels`, `activity_templates`) without a service key.
Per-child data stays parent/admin-only — never readable cross-parent.

Catalogue tables (`subjects`, `skills`, `difficulty_levels`, `badges`) are
readable by any authenticated user (`using (auth.role() = 'authenticated')`)
since they're shared, non-sensitive reference data, but writable only by
admins.

The child never authenticates directly in V1 (no child login) — the child
UI runs inside the parent's authenticated session, scoped client-side to the
selected `child_id`; the same RLS policies above already guarantee the
parent's session can only reach their own children's rows.

## 8. Seed data (`supabase/seed.sql`)

Ships: the three subjects (English, Afrikaans, Mathematics), a starter skill
list per subject, three difficulty levels, and ~6 starter badges. This is
reference/catalogue data only — no fake parents or children.
