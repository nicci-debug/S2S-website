"use server";

import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { childSchema } from "@/lib/validation/child";

export interface ChildFormState {
  error?: string;
}

export async function createChildAction(
  _prevState: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    grade: formData.get("grade") ?? "",
    homeLanguage: formData.get("homeLanguage"),
    avatarId: formData.get("avatarId"),
    subjectIds: formData.getAll("subjectIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  const { supabase, parentProfile } = await requireParentSession();
  const { name, age, grade, homeLanguage, avatarId, subjectIds } = parsed.data;

  const { data: child, error: childError } = await supabase
    .from("children")
    .insert({
      parent_id: parentProfile.id,
      name,
      age,
      grade: grade || null,
      home_language: homeLanguage,
      avatar_id: avatarId,
    })
    .select("id")
    .single();

  if (childError || !child) {
    return { error: "Could not save your child's profile. Please try again." };
  }

  const priorityRows = subjectIds.map((subjectId, index) => ({
    child_id: child.id,
    subject_id: subjectId,
    priority: index,
  }));

  // Best-effort: if subjectIds are fallback catalogue codes (no live
  // Supabase project attached yet) this insert fails on the FK and is
  // ignored — the child profile itself is already saved.
  if (priorityRows.length > 0) {
    await supabase.from("child_learning_priorities").insert(priorityRows);
  }

  redirect("/parent/dashboard");
}
