"use server";

import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { practiceSetDraftSchema } from "@/lib/validation/practiceSet";
import { persistAndAssignPracticeSet } from "@/lib/practiceSets";

export interface CreatePracticeState {
  error?: string;
}

export async function createManualPracticeSetAction(
  _prevState: CreatePracticeState,
  formData: FormData,
): Promise<CreatePracticeState> {
  const raw = formData.get("draft");
  if (typeof raw !== "string") {
    return { error: "Something went wrong. Please try again." };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  const parsed = practiceSetDraftSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your practice set." };
  }

  const { supabase, parentProfile, user } = await requireParentSession();

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", parsed.data.childId)
    .eq("parent_id", parentProfile.id)
    .maybeSingle();

  if (!child) {
    return { error: "That child could not be found." };
  }

  const result = await persistAndAssignPracticeSet(supabase, {
    ...parsed.data,
    parentId: parentProfile.id,
    createdBy: user.id,
    sourceType: "manual",
  });

  if ("error" in result) {
    return { error: result.error };
  }

  redirect(`/parent/children`);
}
