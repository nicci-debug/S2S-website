"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { SentenceBuildingData } from "@/lib/activity-schema";
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

export function SentenceBuilding({
  data,
  onAnswer,
  answered,
  isCorrect,
}: ActivityQuestionProps<SentenceBuildingData>) {
  const tiles = useMemo(
    () => shuffle(data.words.map((word, index) => ({ word, key: `${word}-${index}` }))),
    [data.words],
  );
  const [built, setBuilt] = useState<Array<{ word: string; key: string }>>([]);

  const usedKeys = new Set(built.map((t) => t.key));

  function addTile(tile: { word: string; key: string }) {
    if (answered) return;
    setBuilt((prev) => [...prev, tile]);
  }

  function removeTile(key: string) {
    if (answered) return;
    setBuilt((prev) => prev.filter((t) => t.key !== key));
  }

  function submit() {
    onAnswer({ kind: "words", value: built.map((t) => t.word) });
  }

  return (
    <div>
      <p className="text-lg font-bold text-zumi-ink">Build the sentence:</p>

      <div className="mt-3 flex min-h-14 flex-wrap gap-2 rounded-2xl border-2 border-dashed border-zumi-slate-200 bg-white p-3">
        {built.length === 0 ? (
          <span className="text-sm text-zumi-slate-500">Tap the words below in order</span>
        ) : (
          built.map((tile) => (
            <button
              key={tile.key}
              type="button"
              disabled={answered}
              onClick={() => removeTile(tile.key)}
              className="rounded-full bg-zumi-violet-500 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {tile.word}
            </button>
          ))
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            disabled={answered || usedKeys.has(tile.key)}
            onClick={() => addTile(tile)}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-all",
              usedKeys.has(tile.key)
                ? "border-zumi-slate-100 bg-zumi-slate-100 text-zumi-slate-300"
                : "border-zumi-slate-200 bg-white text-zumi-ink hover:border-zumi-violet-300",
            )}
          >
            {tile.word}
          </button>
        ))}
      </div>

      {!answered ? (
        <Button className="mt-4" onClick={submit} disabled={built.length !== data.words.length}>
          Check sentence
        </Button>
      ) : null}
      <AnswerFeedback isCorrect={isCorrect} />
    </div>
  );
}
