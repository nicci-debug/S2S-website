"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { MultipleChoiceData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { AnswerFeedback } from "./Feedback";

export function MultipleChoice({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<MultipleChoiceData>) {
  const [selected, setSelected] = useState<string | null>(null);

  function choose(option: string) {
    if (answered) return;
    setSelected(option);
    onAnswer({ kind: "text", value: option });
  }

  return (
    <div>
      <p className="text-lg font-bold text-zumi-ink">{data.prompt}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.options.map((option) => {
          const isSelected = selected === option;
          const showCorrect = answered && option === data.answer;
          const showWrong = answered && isSelected && option !== data.answer;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={answered}
              className={cn(
                "rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all",
                showCorrect && "border-zumi-mint-500 bg-zumi-mint-400/15 text-zumi-mint-500",
                showWrong && "border-zumi-coral-500 bg-zumi-coral-500/10 text-zumi-coral-600",
                !showCorrect && !showWrong && isSelected && "border-zumi-violet-500 bg-zumi-violet-50",
                !showCorrect && !showWrong && !isSelected && "border-zumi-slate-200 bg-white hover:border-zumi-violet-300",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      <AnswerFeedback isCorrect={isCorrect} />
    </div>
  );
}
