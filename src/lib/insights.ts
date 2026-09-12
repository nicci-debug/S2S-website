import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type DbClient = SupabaseClient<Database>;

export interface SkillInsight {
  skillId: string;
  name: string;
  masteryScore: number;
}

export interface WeeklyInsights {
  minutesLearned: number;
  activitiesCompleted: number;
  accuracy: number;
  strongest: SkillInsight | null;
  weakest: SkillInsight | null;
}

/** Monday 00:00 UTC on or before `date`. A V1 simplification — see
 * ARCHITECTURE.md's note on parent_profiles.timezone for the follow-up of
 * computing this per-parent instead of in UTC. */
export function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

export function endOfWeek(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

export async function getWeeklyInsights(
  supabase: DbClient,
  childId: string,
  weekStart: Date,
  weekEnd: Date,
): Promise<WeeklyInsights> {
  const { data: attempts } = await supabase
    .from("attempts")
    .select("is_correct, time_taken_ms")
    .eq("child_id", childId)
    .gte("attempted_at", weekStart.toISOString())
    .lt("attempted_at", weekEnd.toISOString());

  const activitiesCompleted = attempts?.length ?? 0;
  const correctCount = attempts?.filter((a) => a.is_correct).length ?? 0;
  const totalMs = (attempts ?? []).reduce((sum, a) => sum + (a.time_taken_ms ?? 0), 0);

  const { data: progress } = await supabase
    .from("child_skill_progress")
    .select("skill_id, mastery_score, skills(name)")
    .eq("child_id", childId)
    .gte("last_practised_at", weekStart.toISOString())
    .lt("last_practised_at", weekEnd.toISOString())
    .order("mastery_score", { ascending: false });

  const withNames: SkillInsight[] = (progress ?? [])
    .filter((p) => p.skills?.name)
    .map((p) => ({ skillId: p.skill_id, name: p.skills!.name, masteryScore: p.mastery_score }));

  return {
    minutesLearned: Math.round(totalMs / 60000),
    activitiesCompleted,
    accuracy: activitiesCompleted > 0 ? Math.round((correctCount / activitiesCompleted) * 100) : 0,
    strongest: withNames[0] ?? null,
    weakest: withNames.length > 1 ? withNames[withNames.length - 1] : null,
  };
}
