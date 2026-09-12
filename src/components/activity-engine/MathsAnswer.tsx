"use client";

import type { MathsAnswerData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { FreeTextAnswer } from "./FreeTextAnswer";

export function MathsAnswer({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<MathsAnswerData>) {
  return (
    <FreeTextAnswer
      prompt={data.question}
      correctAnswerLabel={String(data.answer)}
      inputType="number"
      answered={answered}
      isCorrect={isCorrect}
      onSubmit={(value) => onAnswer({ kind: "number", value: Number(value) })}
    />
  );
}
