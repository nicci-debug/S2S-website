"use server";

import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { childSchema } from "@/lib/validation/child";
import { createChildForParent } from "@/lib/children";

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
  const result = await createChildForParent(supabase, parentProfile.id, parsed.data);

  if ("error" in result) {
    return { error: result.error };
  }

  redirect("/parent/dashboard");
}
