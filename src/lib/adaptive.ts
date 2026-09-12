/**
 * Pure, unit-testable adaptive-learning functions — no I/O (ARCHITECTURE.md
 * §5). Route handlers call these and persist the result. Spaced repetition
 * uses a simple increasing-interval schedule that resets on a wrong answer
 * and advances one step on a correct one, rather than immediate repetitive
 * drilling.
 */

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];
const MASTERY_LEARNING_RATE = 0.3;
export const NEEDS_PRACTICE_THRESHOLD = 60;

export function clampMastery(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Moves mastery toward 100 on a correct answer and toward 0 on an
 * incorrect one, weighted more heavily toward the most recent attempt
 * (a simple exponential moving average).
 */
export function nextMastery(current: number, wasCorrect: boolean): number {
  const delta = wasCorrect ? (100 - current) * MASTERY_LEARNING_RATE : -(current * MASTERY_LEARNING_RATE);
  return Math.round(clampMastery(current + delta) * 100) / 100;
}

/** A correct answer advances one step; a wrong one resets to the shortest interval. */
export function nextReviewStep(currentStep: number, wasCorrect: boolean): number {
  if (!wasCorrect) return 0;
  return Math.min(currentStep + 1, REVIEW_INTERVAL_DAYS.length - 1);
}

export function nextReviewDate(step: number, from: Date): Date {
  const days = REVIEW_INTERVAL_DAYS[step] ?? REVIEW_INTERVAL_DAYS[0];
  const result = new Date(from);
  result.setDate(result.getDate() + days);
  return result;
}

export interface SkillProgressState {
  attemptsCount: number;
  correctCount: number;
  incorrectCount: number;
  masteryScore: number;
  reviewStep: number;
}

export interface SkillProgressUpdate extends SkillProgressState {
  accuracy: number;
  nextReviewAt: string;
}

/** Applies one attempt's outcome to a skill's progress state. */
export function applyAttemptToProgress(
  state: SkillProgressState,
  wasCorrect: boolean,
  now: Date,
): SkillProgressUpdate {
  const attemptsCount = state.attemptsCount + 1;
  const correctCount = state.correctCount + (wasCorrect ? 1 : 0);
  const incorrectCount = state.incorrectCount + (wasCorrect ? 0 : 1);
  const masteryScore = nextMastery(state.masteryScore, wasCorrect);
  const reviewStep = nextReviewStep(state.reviewStep, wasCorrect);

  return {
    attemptsCount,
    correctCount,
    incorrectCount,
    masteryScore,
    reviewStep,
    accuracy: Math.round((correctCount / attemptsCount) * 10000) / 100,
    nextReviewAt: nextReviewDate(reviewStep, now).toISOString(),
  };
}
