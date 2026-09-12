import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ChildInput } from "@/lib/validation/child";

type DbClient = SupabaseClient<Database>;

export async function createChildForParent(
  supabase: DbClient,
  parentId: string,
  input: ChildInput,
): Promise<{ id: string } | { error: string }> {
  const { data: child, error } = await supabase
    .from("children")
    .insert({
      parent_id: parentId,
      name: input.name,
      age: input.age,
      grade: input.grade || null,
      home_language: input.homeLanguage,
      avatar_id: input.avatarId,
    })
    .select("id")
    .single();

  if (error || !child) {
    return { error: "Could not save your child's profile. Please try again." };
  }

  await setChildLearningPriorities(supabase, child.id, input.subjectIds);
  return { id: child.id };
}

export async function updateChild(
  supabase: DbClient,
  childId: string,
  input: ChildInput,
): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase
    .from("children")
    .update({
      name: input.name,
      age: input.age,
      grade: input.grade || null,
      home_language: input.homeLanguage,
      avatar_id: input.avatarId,
    })
    .eq("id", childId);

  if (error) {
    return { error: "Could not update your child's profile. Please try again." };
  }

  await supabase.from("child_learning_priorities").delete().eq("child_id", childId);
  await setChildLearningPriorities(supabase, childId, input.subjectIds);
  return { ok: true };
}

async function setChildLearningPriorities(supabase: DbClient, childId: string, subjectIds: string[]) {
  if (subjectIds.length === 0) return;
  const rows = subjectIds.map((subjectId, index) => ({
    child_id: childId,
    subject_id: subjectId,
    priority: index,
  }));
  // Best-effort: fails silently against fallback (non-UUID) catalogue codes
  // when no live Supabase project is attached — the child profile itself
  // is already saved regardless.
  await supabase.from("child_learning_priorities").insert(rows);
}
