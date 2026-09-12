"use client";

import { useMemo, useState } from "react";
import type { ActivityType } from "@/types/database";
import type { QuestionData } from "@/lib/activity-schema";
import type { GivenAnswer } from "@/lib/grading";
import { gradeAnswer } from "@/lib/grading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ACTIVITY_TYPE_LABELS } from "@/lib/activity-schema";
import { ActivityRenderer } from "./ActivityRenderer";

export interface PlayerActivity {
  id: string;
  type: ActivityType;
  title: string;
  instructions?: string | null;
  questions: Array<{ id: string; data: QuestionData }>;
}

interface FlatQuestion {
  activityId: string;
  activityType: ActivityType;
  activityTitle: string;
  activityInstructions?: string | null;
  questionId: string;
  data: QuestionData;
}

interface ActivityPlayerProps {
  activities: PlayerActivity[];
  onAnswer?: (params: {
    activityId: string;
    questionId: string;
    given: GivenAnswer;
    isCorrect: boolean;
    timeTakenMs: number;
  }) => void | Promise<void>;
  onComplete?: (summary: { totalQuestions: number; correctCount: number }) => void | Promise<void>;
}

/**
 * The activity engine's session runner. Entirely generic over activity
 * type — it flattens the assigned activities into a question queue and
 * delegates rendering/grading per-question to ActivityRenderer +
 * lib/grading. Nothing here branches on activity type.
 */
export function ActivityPlayer({ activities, onAnswer, onComplete }: ActivityPlayerProps) {
  const flatQuestions = useMemo<FlatQuestion[]>(
    () =>
      activities.flatMap((activity) =>
        activity.questions.map((q) => ({
          activityId: activity.id,
          activityType: activity.type,
          activityTitle: activity.title,
          activityInstructions: activity.instructions,
          questionId: q.id,
          data: q.data,
        })),
      ),
    [activities],
  );

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredState, setAnsweredState] = useState<{ answered: boolean; isCorrect: boolean | null }>({
    answered: false,
    isCorrect: null,
  });
  const [done, setDone] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());

  const current = flatQuestions[index];
  const total = flatQuestions.length;

  async function handleAnswer(given: GivenAnswer) {
    if (!current || answeredState.answered) return;
    const isCorrect = gradeAnswer(current.data, given) ?? false;
    const timeTakenMs = Date.now() - questionStartedAt;
    setAnsweredState({ answered: true, isCorrect });
    if (isCorrect) setCorrectCount((c) => c + 1);
    await onAnswer?.({
      activityId: current.activityId,
      questionId: current.questionId,
      given,
      isCorrect,
      timeTakenMs,
    });
  }

  async function handleNext() {
    if (index + 1 >= total) {
      setDone(true);
      await onComplete?.({ totalQuestions: total, correctCount });
      return;
    }
    setIndex((i) => i + 1);
    setAnsweredState({ answered: false, isCorrect: null });
    setQuestionStartedAt(Date.now());
  }

  if (total === 0) {
    return (
      <Card>
        <p className="text-zumi-slate-500">This practice has no activities yet.</p>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 text-xl font-bold text-zumi-ink">Session complete!</p>
        <p className="mt-1 text-zumi-slate-500">
          {correctCount} / {total} correct
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-3 h-2 w-full rounded-full bg-zumi-slate-200">
        <div
          className="h-2 rounded-full bg-zumi-violet-500 transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zumi-slate-500">
        {ACTIVITY_TYPE_LABELS[current.activityType]} · {index + 1} / {total}
      </p>
      <Card>
        {current.activityInstructions ? (
          <p className="mb-3 text-sm text-zumi-slate-500">{current.activityInstructions}</p>
        ) : null}
        <ActivityRenderer
          key={current.questionId}
          data={current.data}
          onAnswer={handleAnswer}
          answered={answeredState.answered}
          isCorrect={answeredState.isCorrect}
        />
        {answeredState.answered ? (
          <Button className="mt-5 w-full" size="lg" onClick={handleNext}>
            {index + 1 >= total ? "Finish" : "Next"}
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
