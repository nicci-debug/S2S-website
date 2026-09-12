import type { Metadata } from "next";
import Link from "next/link";
import { requireChildAccess } from "@/lib/auth-helpers";
import { levelForXp } from "@/lib/gamification";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AVATAR_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = { title: "My Zumi" };

export default async function ChildDashboardPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const { supabase, child } = await requireChildAccess(childId);

  const avatar = AVATAR_OPTIONS.find((a) => a.id === child.avatar_id) ?? AVATAR_OPTIONS[0];
  const { level, xpIntoLevel, xpForNextLevel } = levelForXp(child.total_xp);

  const [{ data: nextAssignment }, { data: needsPractice }, { data: priorities }, { data: badges }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("id, practice_sets(title)")
        .eq("child_id", childId)
        .neq("status", "completed")
        .order("assigned_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("child_skill_progress")
        .select("mastery_score, skills(name)")
        .eq("child_id", childId)
        .order("mastery_score", { ascending: true })
        .limit(3),
      supabase
        .from("child_learning_priorities")
        .select("subjects(name)")
        .eq("child_id", childId)
        .order("priority"),
      supabase
        .from("child_badges")
        .select("earned_at, badges(name, icon)")
        .eq("child_id", childId)
        .order("earned_at", { ascending: false })
        .limit(6),
    ]);

  return (
    <div className="space-y-6 pt-4">
      <Card className="bg-zumi-violet-600 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl">
            {avatar.emoji}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">
              {child.name} · Level {level}
            </p>
            <div className="mt-2 h-3 w-full rounded-full bg-white/20">
              <div
                className="h-3 rounded-full bg-zumi-amber-400"
                style={{ width: `${(xpIntoLevel / xpForNextLevel) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-white/80">
              {xpIntoLevel} / {xpForNextLevel} XP to next level
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 text-center">
            <p className="text-xl">🔥</p>
            <p className="text-sm font-bold">{child.current_streak}</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-zumi-coral-500">
          Today&apos;s goal
        </p>
        {nextAssignment ? (
          <>
            <p className="mt-1 text-lg font-bold text-zumi-ink">
              {nextAssignment.practice_sets?.title ?? "Practice session"}
            </p>
            <Link href={`/child/${childId}/session/${nextAssignment.id}`}>
              <Button size="lg" className="mt-4 w-full">
                Start Today&apos;s Zumi
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-zumi-slate-500">
              No practice assigned yet — ask a parent to create one for you!
            </p>
            <Button size="lg" className="mt-4 w-full" disabled>
              Start Today&apos;s Zumi
            </Button>
          </>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-zumi-mint-500">
            Recommended practice
          </p>
          {needsPractice && needsPractice.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {needsPractice.map((row, i) => {
                const skillName = row.skills?.name ?? "Skill";
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zumi-ink">{skillName}</span>
                    <span className="text-zumi-slate-500">
                      {Math.round(row.mastery_score)}% mastered
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zumi-slate-500">
              Complete a few sessions to see recommendations here.
            </p>
          )}
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-zumi-violet-600">
            Subjects
          </p>
          {priorities && priorities.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {priorities.map((row, i) => (
                <span
                  key={i}
                  className="rounded-full bg-zumi-violet-50 px-3 py-1 text-sm font-semibold text-zumi-violet-700"
                >
                  {row.subjects?.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zumi-slate-500">No subjects chosen yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-zumi-amber-500">Rewards</p>
        {badges && badges.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {badges.map((row, i) => {
              const badge = row.badges;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-zumi-amber-400/15 px-4 py-3"
                >
                  <span className="text-2xl">🏅</span>
                  <span className="text-xs font-semibold text-zumi-ink">{badge?.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zumi-slate-500">
            Complete practice sessions to earn your first badge!
          </p>
        )}
      </Card>
    </div>
  );
}
