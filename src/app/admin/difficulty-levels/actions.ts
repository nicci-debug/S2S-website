"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-helpers";

const createSchema = z.object({
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscores only"),
  label: z.string().trim().min(1).max(40),
  rank: z.coerce.number().int().min(1).max(20),
});

export interface AdminFormState {
  error?: string;
}

export async function createDifficultyLevelAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = createSchema.safeParse({
    code: formData.get("code"),
    label: formData.get("label"),
    rank: formData.get("rank"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { supabase } = await requireAdminSession();
  const { error } = await supabase.from("difficulty_levels").insert(parsed.data);

  if (error) {
    return { error: "Could not create — check the code and rank are unique." };
  }

  revalidatePath("/admin/difficulty-levels");
  return {};
}
