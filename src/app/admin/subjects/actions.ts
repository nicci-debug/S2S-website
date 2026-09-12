"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-helpers";

const createSchema = z.object({
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscores only"),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
});

export interface AdminFormState {
  error?: string;
}

export async function createSubjectAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = createSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { supabase } = await requireAdminSession();
  const { error } = await supabase.from("subjects").insert(parsed.data);

  if (error) {
    return { error: error.message.includes("duplicate") ? "That subject code already exists." : "Could not create subject." };
  }

  revalidatePath("/admin/subjects");
  return {};
}

export async function toggleSubjectActiveAction(subjectId: string, isActive: boolean): Promise<void> {
  const { supabase } = await requireAdminSession();
  await supabase.from("subjects").update({ is_active: !isActive }).eq("id", subjectId);
  revalidatePath("/admin/subjects");
}
