# Zumi — Product Specification

## 1. Vision

**Turn this week's schoolwork into 10 minutes of personalised practice.**

Zumi is a premium, game-based learning app for children aged ~6–12. The
differentiator versus generic drill apps (Duolingo, Lingokids-style products)
is that a **parent supplies the actual content the child is being taught at
school this week** — a spelling list, a vocabulary sheet, a maths topic, a
homework instruction sheet — and Zumi turns that into structured, adaptive,
game-based practice for the child, in minutes, with no lesson authoring by
Zumi's team required for that specific content.

Initial market: South Africa. Initial curriculum areas: English, Afrikaans,
Mathematics. Architecture must generalise to more subjects/languages/regions
without rework (see ARCHITECTURE.md §Internationalisation).

## 2. Users

### Parent
- Owns the account. Creates and manages one or more child profiles.
- Supplies schoolwork content ("Create Practice") and assigns it to a child.
- Views progress, insights, and weekly reports per child.
- Controls all sensitive settings; the child cannot change account-level
  settings or safety controls.

### Child (~6–12)
- Uses a simplified, icon-first, low-reading interface independently.
- Plays short (~10 minute) daily sessions built from parent-assigned and
  system-recommended practice.
- Earns XP, levels, streaks, stars and badges. Never sees ads, public
  profiles, leaderboards, or open chat.

### Admin (Zumi staff)
- Manages the global curriculum catalogue (subjects, skills, activity
  templates, badges, difficulty levels) and moderates AI-generated content.
- Read-only visibility into aggregate, non-identifying platform analytics.

## 3. Core User Journeys

### 3.1 Parent onboarding
1. Parent signs up (email + password via Supabase Auth).
2. A `parent_profiles` row is created for the new user.
3. Parent is walked through adding their first child: name, age, grade,
   home language, subjects, learning priorities.
4. Parent lands on the Parent Dashboard with the new child card visible and
   an empty state prompting **Create Practice**.

### 3.2 Create Practice (parent)
1. Parent picks a child and a subject.
2. Parent supplies content via one of: type manually, paste a list (e.g.
   spelling/vocab), paste homework instructions, or enter a maths topic.
   (Image/document upload is a defined but not-yet-wired Phase 2 extension —
   the schema and storage bucket exist; the UI entry point is stubbed.)
3. Parent chooses "Generate with AI" (sends input to the backend AI service,
   see §AI Generation) or builds activities manually from the same
   structured template.
4. The result is a **draft practice set** made of one or more **activities**,
   each with structured **questions**. Parent previews every question.
5. Parent edits/removes anything wrong, then **assigns** the set to a child
   (optionally with a due date). It becomes visible in that child's queue.

### 3.3 Child daily session
1. Child opens their home screen: avatar, level, XP, streak, today's goal,
   recommended practice, subjects, rewards shelf.
2. Child taps **Start Today's Zumi**.
3. The engine assembles a ~10 minute session: warm-up question, vocabulary
   activity, a game-style activity, skill practice (prioritising weak/
   due-for-review skills), a quick quiz, then a reward screen.
4. Every answer is recorded as an `attempt`; skill mastery and XP update
   live; the reward screen shows XP earned, streak status, and any new
   badge.

### 3.4 Parent insights & weekly report
1. Parent Dashboard shows this-week totals (minutes, activities, accuracy),
   strongest skills, and skills needing practice, computed from
   `child_skill_progress` and `attempts`.
2. A `weekly_reports` row is generated per child per week (on-demand in V1;
   see IMPLEMENTATION_PLAN.md for the cron-based follow-up) summarising
   progress and recommending next week's focus.

### 3.5 Admin
1. Admin logs in with an account whose `users.role = 'admin'`.
2. Manages the shared catalogue: subjects, skills, difficulty levels,
   badges, activity templates.
3. Reviews AI-generated practice sets flagged for moderation and platform
   analytics (aggregate counts only — never child-identifying content).

## 4. Activity Types (V1)

1. Multiple choice
2. Match pairs
3. Flash cards
4. Fill in the blank
5. Spelling input
6. True/false
7. Unscramble word
8. Maths answer
9. Translation
10. Sentence building

Every activity type is driven entirely by structured JSON (see
ARCHITECTURE.md §Activity Engine) — no activity type is ever hardcoded into
a page component.

## 5. Adaptive Learning (V1 rules)

Tracked per child per skill (`child_skill_progress`): attempts, correct,
incorrect, accuracy, mastery score (0–100), last practised, next review due
date.

Simple V1 policy:
- Mastery score moves toward 100 on correct answers and toward 0 on
  incorrect answers, weighted more heavily by recent attempts.
- A skill below the "needs practice" mastery threshold is: (a) served at a
  reduced difficulty tier next time, (b) given an extra worked example before
  the next question of that skill, and (c) prioritised into the next
  session's skill-practice slot.
- Spaced repetition: each skill gets a `next_review_at` computed with a
  simple increasing-interval schedule (1 day → 3 days → 7 days → 14 days →
  30 days) that resets to the shortest interval on a wrong answer and
  advances one step on a correct one. The session builder always pulls
  "due" skills first, rather than immediately re-drilling the same item.

## 6. Gamification (V1)

XP per correct answer (small) and per completed activity/session (larger,
flat bonus). Levels are an XP curve (see ARCHITECTURE.md). Streak increments
once per calendar day with any completed session; missing a day **pauses**
the streak counter rather than zeroing it harshly (a "streak freeze" grace of
one missed day before reset — encouraging, not punitive). Badges are
criteria-based (e.g. "7-day streak", "First 100% quiz", "Afrikaans
vocabulary novice") and unlock cosmetic avatar accessories.

## 7. Safety & Privacy (non-negotiable)

- No advertising, no public profiles, no child-to-child messaging, no public
  leaderboards, no open-ended AI chat surface for children.
- All child data access is scoped through parent ownership via Postgres Row
  Level Security — enforced in the database, not just the UI.
- AI generation runs server-side only; a browser never holds an AI provider
  key; AI output is schema-validated before it can reach a child.
- Minimum necessary data: no child contact info, no location, no device
  fingerprinting beyond what Supabase Auth needs for the parent account.

## 8. Out of scope for this MVP (explicitly deferred)

- Payments/subscriptions.
- Native mobile shell (the app is responsive web, mobile-first).
- Document/image OCR ingestion (schema/storage bucket reserved, UI stubbed).
- Push notifications / email digests (weekly report is in-app only in V1).
- Multi-parent/co-parent sharing of one child profile.
