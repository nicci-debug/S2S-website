"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { MatchPairsData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";
import { AnswerFeedback } from "./Feedback";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MatchPairs({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<MatchPairsData>) {
  const leftItems = useMemo(() => shuffle(data.pairs.map((p) => p.left)), [data.pairs]);
  const rightItems = useMemo(() => shuffle(data.pairs.map((p) => p.right)), [data.pairs]);

  const [matched, setMatched] = useState<Array<{ left: string; right: string }>>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  function isMatched(value: string) {
    return matched.some((m) => m.left === value || m.right === value);
  }

  function pickRight(right: string) {
    if (answered || !selectedLeft || isMatched(right)) return;
    const correctPair = data.pairs.find((p) => p.left === selectedLeft);
    const isRightMatch = correctPair?.right === right;

    if (isRightMatch) {
      const nextMatched = [...matched, { left: selectedLeft, right }];
      setMatched(nextMatched);
      setSelectedLeft(null);
      if (nextMatched.length === data.pairs.length) {
        onAnswer({ kind: "pairs", value: nextMatched });
      }
    } else {
      setWrongPair(right);
      setTimeout(() => setWrongPair(null), 500);
      setSelectedLeft(null);
    }
  }

  return (
    <div>
      {data.prompt ? <p className="text-lg font-bold text-zumi-ink">{data.prompt}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {leftItems.map((left) => (
            <button
              key={left}
              type="button"
              disabled={answered || isMatched(left)}
              onClick={() => setSelectedLeft(left)}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition-all",
                isMatched(left) && "border-zumi-mint-500 bg-zumi-mint-400/15 text-zumi-mint-500",
                !isMatched(left) &&
                  selectedLeft === left &&
                  "border-zumi-violet-500 bg-zumi-violet-50",
                !isMatched(left) &&
                  selectedLeft !== left &&
                  "border-zumi-slate-200 bg-white hover:border-zumi-violet-300",
              )}
            >
              {left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((right) => (
            <button
              key={right}
              type="button"
              disabled={answered || isMatched(right)}
              onClick={() => pickRight(right)}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition-all",
                isMatched(right) && "border-zumi-mint-500 bg-zumi-mint-400/15 text-zumi-mint-500",
                wrongPair === right && "border-zumi-coral-500 bg-zumi-coral-500/10 text-zumi-coral-600",
                wrongPair !== right &&
                  !isMatched(right) &&
                  "border-zumi-slate-200 bg-white hover:border-zumi-violet-300",
              )}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
      <AnswerFeedback isCorrect={isCorrect} />
    </div>
  );
}
