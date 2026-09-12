# Zumi — Architecture

## 1. Stack

- **Frontend**: Next.js (App Router) + TypeScript (strict mode).
- **UI**: Tailwind CSS v4.
- **Backend**: Next.js Route Handlers / Server Actions running on the
  Node/Vercel runtime — no separate backend service in V1.
- **Database**: Supabase Postgres, accessed via SQL migrations in
  `supabase/migrations`.
- **Auth**: Supabase Auth (email/password in V1).
- **Storage**: Supabase Storage (bucket reserved for future
  document/image upload in Create Practice).
- **AI**: server-side generation service behind a provider interface
  (`src/lib/ai`), never called from the browser.
- **Validation**: Zod, shared between client forms and server actions/route
  handlers.
- **Deployment target**: Vercel-compatible (no filesystem writes, no
  long-lived in-process state).

## 2. Module layout

```
src/
  app/                          Next.js routes (App Router)
    (marketing)/                Public landing page
    (auth)/login, /signup       Parent auth
    onboarding/                 First-child setup wizard
    parent/                     Parent-facing app (layout enforces role)
      dashboard/
      children/[childId]/
      practice/new/             Create Practice flow
      practice/[practiceSetId]/preview/
      reports/[childId]/
    child/[childId]/            Child-facing app (separate layout/theme)
      dashboard/
      session/[assignmentId]/   The activity-engine session player
      rewards/
    admin/                      Admin-only area (layout enforces role)
      subjects/ skills/ badges/ templates/ users/ analytics/
    api/
      ai/generate-practice/     POST — AI generation endpoint
      attempts/                POST — record an attempt
      assignments/[id]/complete/ POST
  components/
    activity-engine/            One renderer component per activity type
    ui/                         Design-system primitives (Button, Card, ...)
    parent/ child/ admin/       Feature-scoped composed components
  lib/
    supabase/                   `server.ts`, `browser.ts`, `admin.ts` clients
    ai/                         Provider interface + MockProvider + AnthropicProvider
    activity-schema.ts          Zod schemas for every activity type (shared)
    gamification.ts             XP/level/streak/badge pure functions
    adaptive.ts                 Mastery + spaced-repetition pure functions
    validation/                 Zod schemas for forms (onboarding, practice)
  types/
    database.ts                 Generated/typed row shapes matching the schema
supabase/
  migrations/                   Ordered, idempotent SQL migrations
  seed.sql                      Reference data (subjects, skills, badges)
```

Route groups separate the three "apps" (parent, child, admin) that share one
codebase but have distinct layouts, navigation and permitted roles. Each
group's `layout.tsx` re-checks the Supabase session and role server-side —
the UI split is not the security boundary, RLS is (see §6).

## 3. Activity Engine

This is the mechanism that lets one content pipeline (manual or AI) drive
ten different mini-games without any activity-specific page code.

**Contract**: every activity in the database has a `type` (one of the ten
enum values) and a list of `questions`, where each question's `data` column
is a JSON payload validated against the Zod schema registered for that
`type` in `src/lib/activity-schema.ts`. Example (`multiple_choice`):

```json
{
  "type": "multiple_choice",
  "prompt": "What does 'padda' mean?",
  "options": ["frog", "bird", "horse", "fish"],
  "answer": "frog"
}
```

**Rendering**: `components/activity-engine/ActivityRenderer.tsx` takes a
`question.data` object, looks up its `type` in a **registry map**
(`type -> Component`), and renders that component. Adding activity type #11
means: add a Zod schema, add a renderer component, add one line to the
registry — no existing renderer, page, or session logic changes.

**Session player** (`app/child/[childId]/session/[assignmentId]/page.tsx`)
is itself generic: it loads the assigned practice set's activities in order,
steps through their questions with `ActivityRenderer`, records an `attempt`
per question via `POST /api/attempts`, and shows the reward screen once the
last activity is done. It has no per-subject or per-activity-type branching.

**Grading**: each renderer reports `{ given, isCorrect }` to the player via a
single `onAnswer` callback; correctness for free-text types (spelling,
translation, maths) is computed by a pure normaliser (trim/case/diacritic-
insensitive compare, or numeric compare) shared with the AI validation step
so "what counts as correct" is defined once.

## 4. AI Content Generation

**Never call an LLM from the browser.** Flow:

```
Parent input (text) --POST--> /api/ai/generate-practice (Route Handler)
    -> lib/ai/generatePracticeSet()
       -> provider.generate(promptSpec)         [server-side only, API key in env]
       -> raw text/JSON from provider
    -> Zod-parse against PracticeSetSchema
    -> semantic validation (age range, activity types supported,
       answer present among options, question count in range, language
       matches requested home language)
    -> on failure: retry once with a stricter repair prompt; on second
       failure: return a structured error, never partially-valid content
    -> on success: return draft PracticeSetInput to the browser (not yet
       persisted)
Parent previews in the browser
    -> POST /api/ai/save-practice persists practice_set/activities/questions
       exactly as previewed (parent-approved content only)
    -> visible to the child activity engine only after an `assignment` row
       exists
```

`lib/ai/provider.ts` defines:

```ts
interface AIProvider {
  generate(spec: PracticeGenerationSpec): Promise<string>; // raw JSON text
}
```

Two implementations ship in V1:
- `MockProvider` — deterministic, offline, template-based generator. Used
  automatically when no provider API key is configured, and in tests/CI, so
  the whole pipeline is exercisable without secrets.
- `AnthropicProvider` — calls the Claude Messages API server-side using
  `ANTHROPIC_API_KEY` (server env var, never exposed to the client) when
  present. Swapping providers is a one-line change in
  `lib/ai/index.ts:getProvider()`; the rest of the pipeline is provider-
  agnostic.

No unrestricted child-facing chat exists anywhere in the product — the only
AI surface is this one parent-facing, schema-constrained generation
endpoint.

## 5. Adaptive Learning & Gamification (pure-function core)

`lib/adaptive.ts` and `lib/gamification.ts` contain pure, unit-testable
functions with no I/O:
- `nextMastery(current, wasCorrect) -> number`
- `nextReviewInterval(stepIndex, wasCorrect) -> { stepIndex, nextReviewAt }`
- `xpForAnswer(isCorrect, difficulty) -> number`, `xpForSessionComplete() -> number`
- `levelForXp(totalXp) -> { level, xpIntoLevel, xpForNextLevel }`
- `applyStreak(lastActiveDate, today) -> { streak, usedFreeze }`

Route handlers/server actions call these functions and persist the result;
this keeps all the "business logic" out of SQL and out of UI code, and makes
it directly testable.

## 6. Security Model

- **RLS is the access boundary**, not page-level checks. Every table that
  contains parent- or child-owned data has policies that resolve through
  `parent_profiles.user_id = auth.uid()`. A parent can only ever see rows for
  children under their own `parent_profiles.id`. See DATABASE.md §RLS.
- Admin access is a `users.role = 'admin'` check inside policies (service
  responsibilities, not a client-trusted flag) plus a server-side layout
  guard that redirects non-admins.
- The Supabase **service role key** is only ever used in trusted server
  contexts (`lib/supabase/admin.ts`) — for admin operations that must bypass
  RLS deliberately (e.g. seeding shared catalogue data) — and is read from a
  server-only env var, never bundled to the client.
- AI provider keys are server-only env vars.
- Zod validates every external input at the boundary: forms, route handler
  bodies, and AI output.

## 7. Internationalisation & multi-region readiness

- `subjects` and `skills` are data, not code — adding a new subject or
  language is a catalogue insert, not a deploy.
- `children.home_language` and `parent_profiles.locale` are free-form BCP-47
  strings today (`en-ZA`, `af-ZA`) rather than an enum, so new locales need
  no migration.
- UI copy lives in `src/lib/i18n/strings.ts` as a flat key→string map from
  day one (even though V1 ships English UI copy only) so a second UI
  language is a new file, not a refactor.
- Currency/timezone are not hardcoded; `parent_profiles.timezone` drives
  streak/day-boundary calculations instead of assuming SAST.

## 8. What's deliberately not built yet (and why)

- Document/image upload ingestion — storage bucket + `practice_sets.source_type`
  enum value (`upload`) are reserved so the schema doesn't need to change
  later, but OCR/parsing is out of scope for this MVP per PRODUCT.md.
- A weekly-report cron — V1 generates a report on demand (parent visits the
  reports page); IMPLEMENTATION_PLAN.md notes the follow-up to move this to
  a scheduled Supabase Edge Function without any schema change.
