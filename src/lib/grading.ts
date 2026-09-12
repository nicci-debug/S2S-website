import type { QuestionData } from "@/lib/activity-schema";

/**
 * "What counts as correct" defined once, shared by the activity engine
 * (grading a child's answer) and the AI validation step (checking a
 * generated answer is gradable at all). Pure — no I/O.
 */

export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function textsMatch(given: string, expected: string): boolean {
  return normalizeText(given) === normalizeText(expected);
}

export function numbersMatch(given: number, expected: number, tolerance = 0): boolean {
  return Math.abs(given - expected) <= tolerance;
}

export function wordArraysMatch(given: string[], expected: string[]): boolean {
  return (
    given.length === expected.length &&
    given.every((word, i) => normalizeText(word) === normalizeText(expected[i]))
  );
}

export type GivenAnswer =
  | { kind: "text"; value: string }
  | { kind: "number"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "words"; value: string[] }
  | { kind: "pairs"; value: Array<{ left: string; right: string }> }
  | { kind: "reviewed"; value: boolean };

/**
 * Grades a single answer against its question's structured data. Returns
 * null if the given answer's shape doesn't match what the question type
 * expects (a defensive case, not expected in normal engine use).
 */
export function gradeAnswer(question: QuestionData, given: GivenAnswer): boolean | null {
  switch (question.type) {
    case "multiple_choice":
      return given.kind === "text" ? textsMatch(given.value, question.answer) : null;
    case "fill_in_the_blank":
      return given.kind === "text" ? textsMatch(given.value, question.answer) : null;
    case "spelling_input":
      return given.kind === "text" ? textsMatch(given.value, question.answer) : null;
    case "unscramble_word":
      return given.kind === "text" ? textsMatch(given.value, question.answer) : null;
    case "translation":
      return given.kind === "text" ? textsMatch(given.value, question.answer) : null;
    case "true_false":
      return given.kind === "boolean" ? given.value === question.answer : null;
    case "maths_answer":
      return given.kind === "number"
        ? numbersMatch(given.value, question.answer, question.tolerance ?? 0)
        : null;
    case "sentence_building":
      return given.kind === "words" ? wordArraysMatch(given.value, question.answer) : null;
    case "match_pairs":
      return given.kind === "pairs"
        ? given.value.length === question.pairs.length &&
            given.value.every((pair) =>
              question.pairs.some(
                (p) => textsMatch(p.left, pair.left) && textsMatch(p.right, pair.right),
              ),
            )
        : null;
    case "flash_cards":
      // Flash cards are self-assessed ("did you know it?") rather than
      // graded against a canonical answer.
      return given.kind === "reviewed" ? given.value : null;
    default:
      return null;
  }
}
