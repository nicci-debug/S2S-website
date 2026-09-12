# Zumi

Turn this week's schoolwork into 10 minutes of personalised practice.

See [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md),
[DATABASE.md](./DATABASE.md) and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
for the full product spec, system design, database schema and phased build
plan.

## Stack

Next.js (App Router) + TypeScript (strict) + Tailwind CSS, Supabase
(Postgres, Auth, Storage), Zod validation, a server-side AI abstraction with
a provider interface (`src/lib/ai`).

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's values
npm run dev
```

### Supabase project

1. Create a project at [supabase.com](https://supabase.com) (or run one
   locally with the Supabase CLI).
2. Apply the migrations in `supabase/migrations/` in order (via the SQL
   editor, `supabase db push`, or `psql`), then `supabase/seed.sql` for the
   starter subjects/skills/difficulty levels/badges.
3. Copy the project's URL, anon key and service role key into `.env.local`
   as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY`.

Without a Supabase project attached, the public marketing page and the
activity engine's own preview still render, but every authenticated route
(parent/child/admin) will show a clear "missing env var" error rather than
working — there's no mock-DB fallback for those.

### AI generation

`ANTHROPIC_API_KEY` is optional. Without it, "Generate with AI" uses a
deterministic, offline `MockProvider` so the whole pipeline works with zero
external secrets (see `src/lib/ai/mockProvider.ts`). Set the key to use the
real Claude-backed provider instead — no other code changes needed.

### Becoming an admin

There's no self-service admin signup (by design — see PRODUCT.md's safety
section). After signing up normally as a parent, grant yourself admin
access directly in the database:

```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

Then visit `/admin`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (also runs the TypeScript check)
- `npm run lint` — ESLint

## Project layout

See ARCHITECTURE.md §2 for the full module layout. Short version:
`src/app` is routes (grouped into public, `/parent`, `/child`, `/admin`,
and `/api`), `src/components/activity-engine` is the generic
render-any-activity-type engine, `src/lib` is business logic (activity
schemas, grading, adaptive learning, gamification, AI), and
`supabase/migrations` is the database schema.
