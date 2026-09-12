"use client";

import { useRouter } from "next/navigation";
import { ActivityPlayer, type PlayerActivity } from "@/components/activity-engine/ActivityPlayer";

interface SessionRunnerProps {
  childId: string;
  assignmentId: string;
  activities: PlayerActivity[];
}

export function SessionRunner({ childId, assignmentId, activities }: SessionRunnerProps) {
  const router = useRouter();

  return (
    <ActivityPlayer
      activities={activities}
      onAnswer={async ({ activityId, questionId, given, timeTakenMs }) => {
        await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, assignmentId, activityId, questionId, given, timeTakenMs }),
        }).catch(() => {
          // Best-effort: a dropped attempt write shouldn't block the session.
        });
      }}
      onComplete={async ({ totalQuestions, correctCount }) => {
        const response = await fetch(`/api/assignments/${assignmentId}/complete`, {
          method: "POST",
        }).catch(() => null);
        const summary = response && response.ok ? await response.json() : {};

        const params = new URLSearchParams({
          total: String(totalQuestions),
          correct: String(correctCount),
          xp: String(summary.xpAwarded ?? 0),
          streak: String(summary.currentStreak ?? 0),
          badges: (summary.newBadgeNames ?? []).join("|"),
        });
        router.push(`/child/${childId}/rewards?${params.toString()}`);
      }}
    />
  );
}
