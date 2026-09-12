"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-helpers";

export async function archivePracticeSetAction(practiceSetId: string): Promise<void> {
  const { supabase } = await requireAdminSession();
  await supabase.from("practice_sets").update({ status: "archived" }).eq("id", practiceSetId);
  revalidatePath("/admin/content");
}
