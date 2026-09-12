"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { FlashCardsData } from "@/lib/activity-schema";
import type { ActivityQuestionProps } from "./types";

export function FlashCards({
  data,
  onAnswer,
  answered,
}: ActivityQuestionProps<FlashCardsData>) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "flex h-40 w-full max-w-sm items-center justify-center rounded-3xl p-6 text-center text-xl font-bold transition-colors",
          flipped ? "bg-zumi-mint-400/15 text-zumi-mint-500" : "bg-zumi-violet-50 text-zumi-violet-700",
        )}
      >
        {flipped ? data.back : data.front}
      </button>
      <p className="mt-2 text-xs text-zumi-slate-500">Tap the card to flip it</p>

      {!answered ? (
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={() => onAnswer({ kind: "reviewed", value: false })}>
            Still learning
          </Button>
          <Button onClick={() => onAnswer({ kind: "reviewed", value: true })}>I knew it!</Button>
        </div>
      ) : null}
    </div>
  );
}
