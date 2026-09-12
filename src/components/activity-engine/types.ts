import type { GivenAnswer } from "@/lib/grading";
import type { QuestionData } from "@/lib/activity-schema";

export interface ActivityQuestionProps<T extends QuestionData = QuestionData> {
  data: T;
  onAnswer: (given: GivenAnswer) => void;
  /** True once this question has been answered — renderers should lock input. */
  answered: boolean;
  /** Whether the last submitted answer was correct, once known. */
  isCorrect: boolean | null;
}
