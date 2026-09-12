import { z } from "zod";
import type { ActivityType } from "@/types/database";

/**
 * One Zod schema per activity type. This is the single source of truth for
 * what "valid structured content" means for each type — the activity
 * engine's renderers, the manual practice-set builder, and the AI
 * generation validator (ARCHITECTURE.md §4) all import from here rather
 * than re-declaring the shape.
 */

export const multipleChoiceSchema = z
  .object({
    type: z.literal("multiple_choice"),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    answer: z.string().min(1),
  })
  .refine((data) => data.options.includes(data.answer), {
    message: "answer must be one of the options",
    path: ["answer"],
  });

export const matchPairsSchema = z.object({
  type: z.literal("match_pairs"),
  prompt: z.string().optional(),
  pairs: z
    .array(z.object({ left: z.string().min(1), right: z.string().min(1) }))
    .min(2)
    .max(8),
});

export const flashCardsSchema = z.object({
  type: z.literal("flash_cards"),
  front: z.string().min(1),
  back: z.string().min(1),
});

export const fillInTheBlankSchema = z.object({
  type: z.literal("fill_in_the_blank"),
  sentence: z.string().min(1).refine((s) => s.includes("___"), {
    message: "sentence must contain a ___ blank",
  }),
  answer: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
});

export const spellingInputSchema = z.object({
  type: z.literal("spelling_input"),
  prompt: z.string().min(1),
  answer: z.string().min(1),
});

export const trueFalseSchema = z.object({
  type: z.literal("true_false"),
  statement: z.string().min(1),
  answer: z.boolean(),
});

export const unscrambleWordSchema = z.object({
  type: z.literal("unscramble_word"),
  scrambled: z.string().min(2),
  answer: z.string().min(2),
  hint: z.string().optional(),
});

export const mathsAnswerSchema = z.object({
  type: z.literal("maths_answer"),
  question: z.string().min(1),
  answer: z.number(),
  tolerance: z.number().min(0).optional(),
});

export const translationSchema = z.object({
  type: z.literal("translation"),
  sourceText: z.string().min(1),
  sourceLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  answer: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
});

export const sentenceBuildingSchema = z
  .object({
    type: z.literal("sentence_building"),
    words: z.array(z.string().min(1)).min(2).max(10),
    answer: z.array(z.string().min(1)).min(2).max(10),
  })
  .refine(
    (data) => {
      const sorted = (arr: string[]) => [...arr].map((w) => w.toLowerCase()).sort();
      const a = sorted(data.words);
      const b = sorted(data.answer);
      return a.length === b.length && a.every((w, i) => w === b[i]);
    },
    { message: "answer must use exactly the given words", path: ["answer"] },
  );

export const questionDataSchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  matchPairsSchema,
  flashCardsSchema,
  fillInTheBlankSchema,
  spellingInputSchema,
  trueFalseSchema,
  unscrambleWordSchema,
  mathsAnswerSchema,
  translationSchema,
  sentenceBuildingSchema,
]);

export type QuestionData = z.infer<typeof questionDataSchema>;
export type MultipleChoiceData = z.infer<typeof multipleChoiceSchema>;
export type MatchPairsData = z.infer<typeof matchPairsSchema>;
export type FlashCardsData = z.infer<typeof flashCardsSchema>;
export type FillInTheBlankData = z.infer<typeof fillInTheBlankSchema>;
export type SpellingInputData = z.infer<typeof spellingInputSchema>;
export type TrueFalseData = z.infer<typeof trueFalseSchema>;
export type UnscrambleWordData = z.infer<typeof unscrambleWordSchema>;
export type MathsAnswerData = z.infer<typeof mathsAnswerSchema>;
export type TranslationData = z.infer<typeof translationSchema>;
export type SentenceBuildingData = z.infer<typeof sentenceBuildingSchema>;

export const ACTIVITY_TYPES: ActivityType[] = [
  "multiple_choice",
  "match_pairs",
  "flash_cards",
  "fill_in_the_blank",
  "spelling_input",
  "true_false",
  "unscramble_word",
  "maths_answer",
  "translation",
  "sentence_building",
];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  multiple_choice: "Multiple choice",
  match_pairs: "Match pairs",
  flash_cards: "Flash cards",
  fill_in_the_blank: "Fill in the blank",
  spelling_input: "Spelling",
  true_false: "True or false",
  unscramble_word: "Unscramble the word",
  maths_answer: "Maths answer",
  translation: "Translation",
  sentence_building: "Sentence building",
};

export function parseQuestionData(data: unknown): QuestionData | null {
  const result = questionDataSchema.safeParse(data);
  return result.success ? result.data : null;
}
