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
      onAnswer={async ({ activityId, questionId, given, isCorrect }) => {
        await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, assignmentId, activityId, questionId, given, isCorrect }),
        }).catch(() => {
          // Best-effort: a dropped attempt write shouldn't block the session.
        });
      }}
      onComplete={async () => {
        await fetch(`/api/assignments/${assignmentId}/complete`, { method: "POST" }).catch(() => {});
        router.push(`/child/${childId}/dashboard`);
      }}
    />
  );
}
