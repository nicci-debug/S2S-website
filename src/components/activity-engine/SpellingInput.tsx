"use client";

import type { SpellingInputData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { FreeTextAnswer } from "./FreeTextAnswer";

export function SpellingInput({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<SpellingInputData>) {
  return (
    <FreeTextAnswer
      prompt={data.prompt}
      correctAnswerLabel={data.answer}
      answered={answered}
      isCorrect={isCorrect}
      onSubmit={(value) => onAnswer({ kind: "text", value })}
    />
  );
}
