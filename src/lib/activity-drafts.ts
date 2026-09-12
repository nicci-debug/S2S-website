import type { ActivityType } from "@/types/database";
import type { QuestionData } from "@/lib/activity-schema";

/** In-progress (not-yet-validated) editor state — used by both the manual
 * builder and the AI-generation preview (Phase 7), which is why this lives
 * outside any one page. */
export interface DraftActivity {
  tempId: string;
  type: ActivityType;
  title: string;
  instructions: string;
  skillId?: string | null;
  questions: QuestionData[];
}

export function emptyQuestionForType(type: ActivityType): QuestionData {
  switch (type) {
    case "multiple_choice":
      return { type, prompt: "", options: ["", ""], answer: "" };
    case "match_pairs":
      return {
        type,
        pairs: [
          { left: "", right: "" },
          { left: "", right: "" },
        ],
      };
    case "flash_cards":
      return { type, front: "", back: "" };
    case "fill_in_the_blank":
      return { type, sentence: "", answer: "" };
    case "spelling_input":
      return { type, prompt: "", answer: "" };
    case "true_false":
      return { type, statement: "", answer: true };
    case "unscramble_word":
      return { type, scrambled: "", answer: "" };
    case "maths_answer":
      return { type, question: "", answer: 0 };
    case "translation":
      return { type, sourceText: "", sourceLanguage: "en-ZA", targetLanguage: "af-ZA", answer: "" };
    case "sentence_building":
      return { type, words: ["", ""], answer: ["", ""] };
  }
}
