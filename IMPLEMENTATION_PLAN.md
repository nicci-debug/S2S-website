# Zumi — Implementation Plan

Repository started empty; this plan reflects a from-scratch build. Each
phase is committed separately; `npm run lint` and `npm run build`
(TypeScript strict + Next.js build, which type-checks) are run before moving
to the next phase. There is no live Supabase project connected in this
environment, so DB-dependent flows are validated by (a) reviewing the SQL
directly, (b) type-checking the query code against generated types, and (c)
a `MockProvider`/local-fixture path for anything that would otherwise
require a live database — this is called out per phase below rather than
glossed over.

## Phase 1 — Project architecture and database
- Next.js + TypeScript (strict) + Tailwind scaffold.
- `supabase/migrations`: identity, curriculum, content, progress,
  gamification, reporting tables; RLS policies; `supabase/seed.sql`.
- `src/lib/supabase/{server,browser,admin}.ts` clients.
- `src/types/database.ts` hand-written row/insert types matching the SQL
  (kept in sync manually in V1; documented follow-up: generate via
  `supabase gen types` once a project ref exists).
- Validation: `npm run lint`, `npm run build`. No DB round-trip possible yet
  (no project) — SQL is reviewed for syntax by running it through `psql
  --dry-run`-style parsing where available, otherwise careful manual review.

## Phase 2 — Authentication and parent onboarding
- `/signup`, `/login` using Supabase Auth (email/password).
- `handle_new_user` trigger inserts into `public.users`.
- `/onboarding` wizard: parent display name → first child (name, age, grade,
  home language, subjects, priorities) → redirect to parent dashboard.
- Server actions for signup-completion and child creation, Zod-validated.

## Phase 3 — Child profiles
- `parent/children` list + add/edit child forms (reuses the onboarding
  child form component).
- Multiple children per parent; child switcher used across parent routes.

## Phase 4 — Child dashboard
- `child/[childId]/dashboard`: avatar, level/XP bar, streak, today's goal,
  recommended practice card, subject shelf, rewards shelf.
- "Start Today's Zumi" resolves to the next open assignment (or a
  system-recommended review session if nothing is assigned).

## Phase 5 — Activity engine
- Zod schemas for all 10 activity types (`lib/activity-schema.ts`).
- One renderer component per type under `components/activity-engine/`.
- Registry map + `ActivityRenderer` dispatcher.
- Generic session player driven by assignment → activities → questions.
- This phase is verified with static fixture data (no DB needed) plus a
  component-level smoke check.

## Phase 6 — Manual practice-set creation
- `parent/practice/new`: pick child + subject → structured manual entry
  form (per activity type) → preview (reuses the activity engine renderers
  in read-only/preview mode) → assign.
- Server action persists `practice_sets`/`activities`/`questions`/
  `assignments` transactionally.

## Phase 7 — AI practice generation
- `lib/ai/provider.ts` interface; `MockProvider` (deterministic, offline);
  `AnthropicProvider` (used only if `ANTHROPIC_API_KEY` is set).
- `POST /api/ai/generate-practice`: input → provider → Zod parse → semantic
  validation (age range, activity type support, answer-in-options, language
  match, question count) → one repair retry on failure → draft result to
  browser (not persisted).
- Reuses the Phase 6 preview/assign UI so accepted AI output and manual
  content go through the same save path.
- Validated end-to-end against `MockProvider` (no external network/API key
  required); `AnthropicProvider` is exercised by unit test with a mocked
  fetch, since no live key exists in this environment.

## Phase 8 — Progress tracking
- `POST /api/attempts`: records an `attempt`, updates
  `child_skill_progress` (mastery, accuracy, spaced-repetition step/
  `next_review_at`) using `lib/adaptive.ts` pure functions, in one
  transaction.
- Assignment auto-completes when its last activity's last question is
  answered.

## Phase 9 — Gamification
- XP awarded per correct answer + per completed session
  (`lib/gamification.ts`), written to `xp_events`, `children.total_xp`/
  `level` cache updated in the same transaction.
- Streak update on session completion (`streaks` + cached columns on
  `children`), one-day freeze grace.
- Badge criteria evaluated after each session; new badges recorded in
  `child_badges` and surfaced on the reward screen.

## Phase 10 — Parent dashboard
- Per-child insights: this-week minutes/activities/accuracy, strongest &
  weakest skills (from `child_skill_progress`), recommended focus.
- On-demand weekly report generation/view (`weekly_reports`).

## Phase 11 — Admin dashboard
- `/admin` (role-gated layout): subjects, skills, difficulty levels,
  badges, activity templates — CRUD.
- AI-generated content moderation list (practice sets with `source_type =
  'ai'`).
- Basic aggregate analytics (counts only — active children, sessions this
  week, activity-type mix) with no per-child drill-down that would expose
  identifying data outside a parent's own view.

## Follow-ups explicitly deferred past this MVP
- Generate `src/types/database.ts` from a live Supabase project
  (`supabase gen types typescript`) once a project ref is provisioned.
- Move weekly report generation to a scheduled Supabase Edge Function/cron.
- Document/image upload → OCR ingestion into `source_type = 'upload'`.
- Automated test suite (unit tests for `lib/adaptive.ts`/`lib/gamification.ts`
  are the highest-value first addition; Playwright for the session player
  next).
