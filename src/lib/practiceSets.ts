import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PracticeSetSourceType } from "@/types/database";
import type { PracticeSetDraft } from "@/lib/validation/practiceSet";

type DbClient = SupabaseClient<Database>;

export interface PersistPracticeSetInput extends PracticeSetDraft {
  parentId: string;
  createdBy: string;
  sourceType: PracticeSetSourceType;
}

/**
 * Persists a practice set + its activities + questions, then assigns it to
 * the child, in a best-effort atomic sequence: Supabase's REST API has no
 * multi-table transaction, so on any failure partway through we delete the
 * practice_sets row, which cascades to clean up everything already
 * inserted under it (see supabase/migrations/0003_content.sql).
 */
export async function persistAndAssignPracticeSet(
  supabase: DbClient,
  input: PersistPracticeSetInput,
): Promise<{ assignmentId: string } | { error: string }> {
  const { data: practiceSet, error: practiceSetError } = await supabase
    .from("practice_sets")
    .insert({
      parent_id: input.parentId,
      child_id: input.childId,
      subject_id: input.subjectId,
      title: input.title,
      source_type: input.sourceType,
      source_input: input.sourceInput ?? null,
      status: "assigned",
      created_by: input.createdBy,
    })
    .select("id")
    .single();

  if (practiceSetError || !practiceSet) {
    return { error: "Could not create the practice set. Please try again." };
  }

  const cleanup = async (message: string) => {
    await supabase.from("practice_sets").delete().eq("id", practiceSet.id);
    return { error: message };
  };

  for (let i = 0; i < input.activities.length; i++) {
    const activity = input.activities[i];
    const { data: activityRow, error: activityError } = await supabase
      .from("activities")
      .insert({
        practice_set_id: practiceSet.id,
        skill_id: activity.skillId ?? null,
        type: activity.type,
        title: activity.title,
        instructions: activity.instructions ?? null,
        difficulty_level_id: null,
        sort_order: i,
      })
      .select("id")
      .single();

    if (activityError || !activityRow) {
      return cleanup("Could not save one of the activities. Please try again.");
    }

    const questionRows = activity.questions.map((data, index) => ({
      activity_id: activityRow.id,
      data,
      sort_order: index,
    }));

    const { error: questionsError } = await supabase.from("questions").insert(questionRows);
    if (questionsError) {
      return cleanup("Could not save the questions. Please try again.");
    }
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({
      practice_set_id: practiceSet.id,
      child_id: input.childId,
      assigned_by: input.parentId,
      due_date: null,
      status: "assigned",
      completed_at: null,
    })
    .select("id")
    .single();

  if (assignmentError || !assignment) {
    return cleanup("Could not assign the practice set. Please try again.");
  }

  return { assignmentId: assignment.id };
}
