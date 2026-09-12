"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TrueFalseData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { AnswerFeedback } from "./Feedback";

export function TrueFalse({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<TrueFalseData>) {
  const [selected, setSelected] = useState<boolean | null>(null);

  function choose(value: boolean) {
    if (answered) return;
    setSelected(value);
    onAnswer({ kind: "boolean", value });
  }

  return (
    <div>
      <p className="text-lg font-bold text-zumi-ink">{data.statement}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[true, false].map((value) => {
          const isSelected = selected === value;
          const showCorrect = answered && value === data.answer;
          const showWrong = answered && isSelected && value !== data.answer;
          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => choose(value)}
              disabled={answered}
              className={cn(
                "rounded-2xl border-2 px-4 py-4 text-center text-lg font-bold transition-all",
                showCorrect && "border-zumi-mint-500 bg-zumi-mint-400/15 text-zumi-mint-500",
                showWrong && "border-zumi-coral-500 bg-zumi-coral-500/10 text-zumi-coral-600",
                !showCorrect && !showWrong && isSelected && "border-zumi-violet-500 bg-zumi-violet-50",
                !showCorrect && !showWrong && !isSelected && "border-zumi-slate-200 bg-white hover:border-zumi-violet-300",
              )}
            >
              {value ? "True" : "False"}
            </button>
          );
        })}
      </div>
      <AnswerFeedback isCorrect={isCorrect} />
    </div>
  );
}
