/**
 * Pure, unit-testable gamification functions — no I/O. Route handlers/
 * server actions call these and persist the result (see
 * ARCHITECTURE.md §5). XP curve is intentionally simple and linear for V1:
 * 100 XP per level.
 */

const XP_PER_LEVEL = 100;
const XP_PER_CORRECT_ANSWER = 10;
const XP_PER_SESSION_COMPLETE = 40;
const STREAK_FREEZE_GRACE_DAYS = 1;

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function levelForXp(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, totalXp);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = safeXp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL };
}

export function xpForAnswer(isCorrect: boolean): number {
  return isCorrect ? XP_PER_CORRECT_ANSWER : 0;
}

export function xpForSessionComplete(): number {
  return XP_PER_SESSION_COMPLETE;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  usedFreezeAt: string | null; // YYYY-MM-DD
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(b) - Date.parse(a)) / msPerDay);
}

/**
 * Applies a completed-session event on `today` (YYYY-MM-DD, in the child's
 * local timezone) to the existing streak state. Missing exactly one day
 * uses the streak "freeze" (grace) instead of resetting to zero — missing
 * two or more days resets it. Practising more than once on the same day
 * is a no-op.
 */
export function applyStreak(state: StreakState, today: string): StreakState {
  if (!state.lastActivityDate) {
    return { ...state, currentStreak: 1, longestStreak: Math.max(1, state.longestStreak), lastActivityDate: today };
  }

  const gap = daysBetween(state.lastActivityDate, today);

  if (gap <= 0) {
    return state; // already practised today
  }

  if (gap === 1) {
    const currentStreak = state.currentStreak + 1;
    return {
      ...state,
      currentStreak,
      longestStreak: Math.max(currentStreak, state.longestStreak),
      lastActivityDate: today,
    };
  }

  if (gap - 1 <= STREAK_FREEZE_GRACE_DAYS && state.usedFreezeAt !== state.lastActivityDate) {
    const currentStreak = state.currentStreak + 1;
    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, state.longestStreak),
      lastActivityDate: today,
      usedFreezeAt: today,
    };
  }

  return {
    currentStreak: 1,
    longestStreak: state.longestStreak,
    lastActivityDate: today,
    usedFreezeAt: null,
  };
}

export interface BadgeCriteria {
  type: "streak" | "sessions_completed" | "perfect_quiz" | "skill_mastery";
  days?: number;
  count?: number;
  score?: number;
}

export interface BadgeEvalContext {
  currentStreak: number;
  sessionsCompleted: number;
  lastQuizWasPerfect: boolean;
  masteryScoresJustUpdated: number[];
}

export function badgeCriteriaMet(criteria: BadgeCriteria, ctx: BadgeEvalContext): boolean {
  switch (criteria.type) {
    case "streak":
      return ctx.currentStreak >= (criteria.days ?? 0);
    case "sessions_completed":
      return ctx.sessionsCompleted >= (criteria.count ?? 0);
    case "perfect_quiz":
      return ctx.lastQuizWasPerfect;
    case "skill_mastery":
      return ctx.masteryScoresJustUpdated.some((score) => score >= (criteria.score ?? 100));
    default:
      return false;
  }
}
