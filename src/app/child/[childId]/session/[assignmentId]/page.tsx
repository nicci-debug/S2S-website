import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireChildAccess } from "@/lib/auth-helpers";
import { parseQuestionData } from "@/lib/activity-schema";
import { SessionRunner } from "./SessionRunner";
import type { PlayerActivity } from "@/components/activity-engine/ActivityPlayer";

export const metadata: Metadata = { title: "Practice session — Zumi" };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ childId: string; assignmentId: string }>;
}) {
  const { childId, assignmentId } = await params;
  const { supabase } = await requireChildAccess(childId);

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, practice_set_id")
    .eq("id", assignmentId)
    .eq("child_id", childId)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const { data: activityRows } = await supabase
    .from("activities")
    .select("id, type, title, instructions, sort_order, questions(id, data, sort_order)")
    .eq("practice_set_id", assignment.practice_set_id)
    .order("sort_order");

  const activities: PlayerActivity[] = (activityRows ?? []).map((activity) => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    instructions: activity.instructions,
    questions: [...activity.questions]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((q) => ({ id: q.id, data: q.data }))
      .filter(
        (q): q is { id: string; data: NonNullable<ReturnType<typeof parseQuestionData>> } =>
          parseQuestionData(q.data) !== null,
      )
      .map((q) => ({ id: q.id, data: parseQuestionData(q.data)! })),
  }));

  return (
    <div className="pt-6">
      <SessionRunner childId={childId} assignmentId={assignmentId} activities={activities} />
    </div>
  );
}
