"use client";

import type { UnscrambleWordData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { FreeTextAnswer } from "./FreeTextAnswer";

export function UnscrambleWord({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<UnscrambleWordData>) {
  return (
    <FreeTextAnswer
      prompt={
        <span>
          Unscramble:{" "}
          <span className="tracking-widest text-zumi-violet-600">
            {data.scrambled.toUpperCase()}
          </span>
          {data.hint ? <span className="ml-2 text-sm text-zumi-slate-500">({data.hint})</span> : null}
        </span>
      }
      correctAnswerLabel={data.answer}
      answered={answered}
      isCorrect={isCorrect}
      onSubmit={(value) => onAnswer({ kind: "text", value })}
    />
  );
}
