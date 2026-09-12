"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-helpers";

const createSchema = z.object({
  subjectId: z.string().min(1),
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscores only"),
  name: z.string().trim().min(1).max(80),
  minAge: z.coerce.number().int().min(4).max(14),
  maxAge: z.coerce.number().int().min(4).max(14),
});

export interface AdminFormState {
  error?: string;
}

export async function createSkillAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = createSchema.safeParse({
    subjectId: formData.get("subjectId"),
    code: formData.get("code"),
    name: formData.get("name"),
    minAge: formData.get("minAge"),
    maxAge: formData.get("maxAge"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { supabase } = await requireAdminSession();
  const { error } = await supabase.from("skills").insert({
    subject_id: parsed.data.subjectId,
    code: parsed.data.code,
    name: parsed.data.name,
    min_age: parsed.data.minAge,
    max_age: parsed.data.maxAge,
  });

  if (error) {
    return { error: "Could not create skill. Check the code is unique for this subject." };
  }

  revalidatePath("/admin/skills");
  return {};
}

export async function toggleSkillActiveAction(skillId: string, isActive: boolean): Promise<void> {
  const { supabase } = await requireAdminSession();
  await supabase.from("skills").update({ is_active: !isActive }).eq("id", skillId);
  revalidatePath("/admin/skills");
}
