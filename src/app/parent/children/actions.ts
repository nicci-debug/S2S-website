"use server";

import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { childSchema } from "@/lib/validation/child";
import { createChildForParent, updateChild } from "@/lib/children";

export interface ChildFormState {
  error?: string;
}

function parseChildForm(formData: FormData) {
  return childSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    grade: formData.get("grade") ?? "",
    homeLanguage: formData.get("homeLanguage"),
    avatarId: formData.get("avatarId"),
    subjectIds: formData.getAll("subjectIds"),
  });
}

export async function addChildAction(
  _prevState: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const parsed = parseChildForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  const { supabase, parentProfile } = await requireParentSession();
  const result = await createChildForParent(supabase, parentProfile.id, parsed.data);

  if ("error" in result) {
    return { error: result.error };
  }

  redirect("/parent/children");
}

export async function editChildAction(
  _prevState: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const childId = formData.get("childId");
  if (typeof childId !== "string" || !childId) {
    return { error: "Missing child." };
  }

  const parsed = parseChildForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  const { supabase, parentProfile } = await requireParentSession();

  // Ownership check — RLS would also block this, but we want a clear
  // error here rather than a silent no-op update.
  const { data: existing } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("parent_id", parentProfile.id)
    .maybeSingle();

  if (!existing) {
    return { error: "Child not found." };
  }

  const result = await updateChild(supabase, childId, parsed.data);
  if ("error" in result) {
    return { error: result.error };
  }

  redirect("/parent/children");
}
