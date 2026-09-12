"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-helpers";

const createSchema = z.object({
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscores only"),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(200).optional(),
  icon: z.string().trim().min(1).max(40),
  criteriaType: z.enum(["streak", "sessions_completed", "perfect_quiz", "skill_mastery"]),
  criteriaValue: z.coerce.number().int().min(0).optional(),
});

export interface AdminFormState {
  error?: string;
}

export async function createBadgeAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = createSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon"),
    criteriaType: formData.get("criteriaType"),
    criteriaValue: formData.get("criteriaValue") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { code, name, description, icon, criteriaType, criteriaValue } = parsed.data;

  let criteria: Record<string, unknown>;
  switch (criteriaType) {
    case "streak":
      criteria = { type: "streak", days: criteriaValue ?? 7 };
      break;
    case "sessions_completed":
      criteria = { type: "sessions_completed", count: criteriaValue ?? 1 };
      break;
    case "skill_mastery":
      criteria = { type: "skill_mastery", score: criteriaValue ?? 90 };
      break;
    case "perfect_quiz":
      criteria = { type: "perfect_quiz" };
      break;
  }

  const { supabase } = await requireAdminSession();
  const { error } = await supabase.from("badges").insert({ code, name, description, icon, criteria });

  if (error) {
    return { error: "Could not create badge. Check the code is unique." };
  }

  revalidatePath("/admin/badges");
  return {};
}

export async function toggleBadgeActiveAction(badgeId: string, isActive: boolean): Promise<void> {
  const { supabase } = await requireAdminSession();
  await supabase.from("badges").update({ is_active: !isActive }).eq("id", badgeId);
  revalidatePath("/admin/badges");
}
