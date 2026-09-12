import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  applyStreak,
  badgeCriteriaMet,
  levelForXp,
  xpForSessionComplete,
  type BadgeCriteria,
} from "@/lib/gamification";

type DbClient = SupabaseClient<Database>;

/**
 * Appends an XP ledger event and keeps children.total_xp/level (a cached
 * aggregate, per DATABASE.md §5) in sync. Best-effort read-then-write like
 * the rest of this codebase's multi-step Supabase REST sequences — see
 * lib/practiceSets.ts for the same trade-off, acceptable for a single
 * child's own session (not a high-concurrency write path).
 */
export async function awardXp(
  supabase: DbClient,
  childId: string,
  amount: number,
  reason: string,
  relatedAssignmentId?: string | null,
): Promise<void> {
  if (amount <= 0) return;

  await supabase
    .from("xp_events")
    .insert({ child_id: childId, amount, reason, related_assignment_id: relatedAssignmentId ?? null });

  const { data: child } = await supabase
    .from("children")
    .select("total_xp")
    .eq("id", childId)
    .maybeSingle();

  const newTotal = (child?.total_xp ?? 0) + amount;
  const { level } = levelForXp(newTotal);
  await supabase.from("children").update({ total_xp: newTotal, level }).eq("id", childId);
}

function todayInTimezone(timezone: string, date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // en-CA formats as YYYY-MM-DD
}

export interface SessionCompletionSummary {
  xpAwarded: number;
  currentStreak: number;
  newBadgeNames: string[];
}

/**
 * Awards session-complete XP, updates the streak (with the one-day freeze
 * grace, PRODUCT.md §6), and evaluates + records any newly-earned badges.
 * Called once per completed assignment from
 * /api/assignments/[id]/complete.
 */
export async function completeSession(
  supabase: DbClient,
  childId: string,
  assignmentId: string,
): Promise<SessionCompletionSummary> {
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", childId)
    .maybeSingle();

  if (!child) {
    return { xpAwarded: 0, currentStreak: 0, newBadgeNames: [] };
  }

  const { data: parentProfile } = await supabase
    .from("parent_profiles")
    .select("timezone")
    .eq("id", child.parent_id)
    .maybeSingle();

  const today = todayInTimezone(parentProfile?.timezone ?? "Africa/Johannesburg");
  const sessionXp = xpForSessionComplete();
  await awardXp(supabase, childId, sessionXp, "session_complete", assignmentId);

  const { data: streakRow } = await supabase
    .from("streaks")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle();

  const updatedStreak = applyStreak(
    {
      currentStreak: streakRow?.current_streak ?? 0,
      longestStreak: streakRow?.longest_streak ?? 0,
      lastActivityDate: streakRow?.last_activity_date ?? null,
      usedFreezeAt: streakRow?.used_freeze_at ?? null,
    },
    today,
  );

  await supabase.from("streaks").upsert(
    {
      child_id: childId,
      current_streak: updatedStreak.currentStreak,
      longest_streak: updatedStreak.longestStreak,
      last_activity_date: updatedStreak.lastActivityDate,
      used_freeze_at: updatedStreak.usedFreezeAt,
    },
    { onConflict: "child_id" },
  );

  await supabase
    .from("children")
    .update({
      current_streak: updatedStreak.currentStreak,
      longest_streak: updatedStreak.longestStreak,
    })
    .eq("id", childId);

  const newBadgeNames = await evaluateBadges(supabase, childId, assignmentId, updatedStreak.currentStreak);

  return { xpAwarded: sessionXp, currentStreak: updatedStreak.currentStreak, newBadgeNames };
}

async function evaluateBadges(
  supabase: DbClient,
  childId: string,
  assignmentId: string,
  currentStreak: number,
): Promise<string[]> {
  const [{ count: sessionsCompleted }, { data: attempts }, { data: progressRows }, { data: badges }, { data: earned }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .eq("child_id", childId)
        .eq("status", "completed"),
      supabase.from("attempts").select("is_correct").eq("assignment_id", assignmentId),
      supabase.from("child_skill_progress").select("mastery_score").eq("child_id", childId),
      supabase.from("badges").select("id, name, criteria").eq("is_active", true),
      supabase.from("child_badges").select("badge_id").eq("child_id", childId),
    ]);

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));
  const lastQuizWasPerfect = Boolean(attempts?.length) && (attempts ?? []).every((a) => a.is_correct);

  const ctx = {
    currentStreak,
    sessionsCompleted: sessionsCompleted ?? 0,
    lastQuizWasPerfect,
    masteryScoresJustUpdated: (progressRows ?? []).map((p) => p.mastery_score),
  };

  const newlyEarned = (badges ?? []).filter(
    (badge) => !earnedIds.has(badge.id) && badgeCriteriaMet(badge.criteria as unknown as BadgeCriteria, ctx),
  );

  if (newlyEarned.length > 0) {
    await supabase
      .from("child_badges")
      .insert(newlyEarned.map((badge) => ({ child_id: childId, badge_id: badge.id })));
  }

  return newlyEarned.map((b) => b.name);
}
