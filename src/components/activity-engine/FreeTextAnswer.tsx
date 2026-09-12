"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { AnswerFeedback } from "./Feedback";

interface FreeTextAnswerProps {
  prompt: ReactNode;
  correctAnswerLabel: string;
  inputType?: "text" | "number";
  answered: boolean;
  isCorrect: boolean | null;
  onSubmit: (rawValue: string) => void;
}

export function FreeTextAnswer({
  prompt,
  correctAnswerLabel,
  inputType = "text",
  answered,
  isCorrect,
  onSubmit,
}: FreeTextAnswerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (answered || value.trim().length === 0) return;
    onSubmit(value);
  }

  return (
    <div>
      <div className="text-lg font-bold text-zumi-ink">{prompt}</div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={answered}
          placeholder="Type your answer"
          autoComplete="off"
        />
        <Button type="submit" disabled={answered || value.trim().length === 0}>
          Check
        </Button>
      </form>
      {answered && isCorrect === false ? (
        <p className="mt-2 text-sm text-zumi-slate-500">
          The answer was: <span className="font-semibold text-zumi-ink">{correctAnswerLabel}</span>
        </p>
      ) : null}
      <AnswerFeedback isCorrect={isCorrect} />
    </div>
  );
}
