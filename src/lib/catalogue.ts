import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { FALLBACK_SUBJECTS } from "@/lib/constants";
import type { SubjectRow } from "@/types/database";

/**
 * Reads the shared subjects catalogue. Falls back to the static seed-data
 * mirror when Supabase isn't configured, so onboarding/practice-creation
 * pages still render in a preview environment with no project attached.
 */
export async function getSubjects(): Promise<Pick<SubjectRow, "id" | "code" | "name">[]> {
  if (!env.isSupabaseConfigured()) {
    return FALLBACK_SUBJECTS.map((s) => ({ id: s.code, code: s.code, name: s.name }));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, code, name")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data || data.length === 0) {
    return FALLBACK_SUBJECTS.map((s) => ({ id: s.code, code: s.code, name: s.name }));
  }

  return data;
}
