import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { FALLBACK_SUBJECTS } from "@/lib/constants";
import type { SkillRow, SubjectRow } from "@/types/database";

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

/**
 * Skills grouped by subject_id, used to let a parent optionally tag an
 * activity with a skill so child_skill_progress can track it (Phase 8).
 * Empty when no live Supabase project is attached — tagging is then
 * unavailable but practice creation still works untagged.
 */
export async function getSkillsBySubject(): Promise<Record<string, Pick<SkillRow, "id" | "name">[]>> {
  if (!env.isSupabaseConfigured()) {
    return {};
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("skills")
    .select("id, subject_id, name")
    .eq("is_active", true)
    .order("name");

  const grouped: Record<string, Pick<SkillRow, "id" | "name">[]> = {};
  for (const skill of data ?? []) {
    (grouped[skill.subject_id] ??= []).push({ id: skill.id, name: skill.name });
  }
  return grouped;
}
