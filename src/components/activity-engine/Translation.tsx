"use client";

import type { TranslationData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { FreeTextAnswer } from "./FreeTextAnswer";
import { MultipleChoice } from "./MultipleChoice";

export function Translation(props: ActivityQuestionProps<TranslationData>) {
  const { data, onAnswer, answered, isCorrect } = props;
  const prompt = `Translate to ${data.targetLanguage}: "${data.sourceText}"`;

  if (data.options && data.options.length > 0) {
    return (
      <MultipleChoice
        data={{ type: "multiple_choice", prompt, options: data.options, answer: data.answer }}
        onAnswer={onAnswer}
        answered={answered}
        isCorrect={isCorrect}
      />
    );
  }

  return (
    <FreeTextAnswer
      prompt={prompt}
      correctAnswerLabel={data.answer}
      answered={answered}
      isCorrect={isCorrect}
      onSubmit={(value) => onAnswer({ kind: "text", value })}
    />
  );
}
