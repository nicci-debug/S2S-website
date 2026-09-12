import type { ComponentType } from "react";
import type { ActivityType } from "@/types/database";
import type { QuestionData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { MultipleChoice } from "./MultipleChoice";
import { MatchPairs } from "./MatchPairs";
import { FlashCards } from "./FlashCards";
import { FillInTheBlank } from "./FillInTheBlank";
import { SpellingInput } from "./SpellingInput";
import { TrueFalse } from "./TrueFalse";
import { UnscrambleWord } from "./UnscrambleWord";
import { MathsAnswer } from "./MathsAnswer";
import { Translation } from "./Translation";
import { SentenceBuilding } from "./SentenceBuilding";

/**
 * The activity engine's registry: one renderer component per activity
 * type. Adding activity type #11 means adding a schema (activity-schema.ts),
 * a renderer, and one line here — nothing else in the app changes.
 */
// Heterogeneous by design: each renderer only accepts its own narrower
// question-data shape, so no single ComponentType<ActivityQuestionProps<T>>
// fits every value here without `any`. ActivityRenderer.tsx is the sole
// call site and only ever invokes a renderer with the question data whose
// `type` matches its own key, so this is sound in practice.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ACTIVITY_RENDERERS: Record<ActivityType, ComponentType<ActivityQuestionProps<any>>> = {
  multiple_choice: MultipleChoice,
  match_pairs: MatchPairs,
  flash_cards: FlashCards,
  fill_in_the_blank: FillInTheBlank,
  spelling_input: SpellingInput,
  true_false: TrueFalse,
  unscramble_word: UnscrambleWord,
  maths_answer: MathsAnswer,
  translation: Translation,
  sentence_building: SentenceBuilding,
};

export function getRendererForType(type: QuestionData["type"]) {
  return ACTIVITY_RENDERERS[type];
}
