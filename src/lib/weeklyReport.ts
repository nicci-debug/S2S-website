import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, WeeklyReportRow } from "@/types/database";
import { getWeeklyInsights } from "@/lib/insights";

type DbClient = SupabaseClient<Database>;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns this week's report for a child, generating and persisting one
 * from current attempts/child_skill_progress data if it doesn't exist yet.
 * V1 generates on demand (parent visits the reports page) rather than on a
 * schedule — see IMPLEMENTATION_PLAN.md's cron follow-up.
 */
export async function getOrCreateWeeklyReport(
  supabase: DbClient,
  childId: string,
  childName: string,
  weekStart: Date,
  weekEnd: Date,
): Promise<WeeklyReportRow> {
  const weekStartStr = isoDate(weekStart);

  const { data: existing } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("child_id", childId)
    .eq("week_start", weekStartStr)
    .maybeSingle();

  if (existing) return existing;

  const insights = await getWeeklyInsights(supabase, childId, weekStart, weekEnd);

  const summaryText =
    insights.activitiesCompleted > 0
      ? `${childName} completed ${insights.activitiesCompleted} activities and spent ${insights.minutesLearned} minutes learning this week, with ${insights.accuracy}% accuracy.`
      : `${childName} hasn't practised yet this week.`;

  const recommendedFocus = insights.weakest
    ? `Practise ${insights.weakest.name} a couple of times next week.`
    : insights.activitiesCompleted > 0
      ? "Keep up the great work — try a new subject next week!"
      : "Assign a short practice session to get the week started.";

  const { data: created, error } = await supabase
    .from("weekly_reports")
    .insert({
      child_id: childId,
      week_start: weekStartStr,
      week_end: isoDate(weekEnd),
      activities_completed: insights.activitiesCompleted,
      minutes_learned: insights.minutesLearned,
      accuracy: insights.accuracy,
      strongest_skill_id: insights.strongest?.skillId ?? null,
      weakest_skill_id: insights.weakest?.skillId ?? null,
      summary_text: summaryText,
      recommended_focus: recommendedFocus,
    })
    .select("*")
    .single();

  if (error || !created) {
    // Best-effort fallback: still show something even if the insert failed
    // (e.g. a race with another request generating the same week).
    return {
      id: "unsaved",
      child_id: childId,
      week_start: weekStartStr,
      week_end: isoDate(weekEnd),
      activities_completed: insights.activitiesCompleted,
      minutes_learned: insights.minutesLearned,
      accuracy: insights.accuracy,
      strongest_skill_id: insights.strongest?.skillId ?? null,
      weakest_skill_id: insights.weakest?.skillId ?? null,
      summary_text: summaryText,
      recommended_focus: recommendedFocus,
      created_at: new Date().toISOString(),
    };
  }

  return created;
}
