"use client";

import type { FillInTheBlankData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { FreeTextAnswer } from "./FreeTextAnswer";
import { MultipleChoice } from "./MultipleChoice";

export function FillInTheBlank(props: ActivityQuestionProps<FillInTheBlankData>) {
  const { data, onAnswer, answered, isCorrect } = props;

  if (data.options && data.options.length > 0) {
    return (
      <MultipleChoice
        data={{ type: "multiple_choice", prompt: data.sentence, options: data.options, answer: data.answer }}
        onAnswer={onAnswer}
        answered={answered}
        isCorrect={isCorrect}
      />
    );
  }

  const [before, after] = data.sentence.split("___");

  return (
    <FreeTextAnswer
      prompt={
        <span>
          {before}
          <span className="mx-1 inline-block min-w-16 border-b-2 border-zumi-violet-400" />
          {after}
        </span>
      }
      correctAnswerLabel={data.answer}
      answered={answered}
      isCorrect={isCorrect}
      onSubmit={(value) => onAnswer({ kind: "text", value })}
    />
  );
}
