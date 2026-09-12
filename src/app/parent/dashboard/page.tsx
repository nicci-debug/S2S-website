import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AVATAR_OPTIONS } from "@/lib/constants";
import { endOfWeek, getWeeklyInsights, startOfWeek } from "@/lib/insights";

export const metadata: Metadata = { title: "Parent dashboard — Zumi" };

export default async function ParentDashboardPage() {
  const { supabase, parentProfile } = await requireParentSession();

  const { data: children } = await supabase
    .from("children")
    .select("id, name, age, grade, avatar_id, total_xp, level, current_streak")
    .eq("parent_id", parentProfile.id)
    .order("created_at");

  if (!children || children.length === 0) {
    redirect("/onboarding");
  }

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);
  const insightsByChild = await Promise.all(
    children.map((child) => getWeeklyInsights(supabase, child.id, weekStart, weekEnd)),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zumi-ink">Your children</h1>
        <Link href="/parent/practice/new">
          <Button size="lg">Create Practice</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {children.map((child, i) => {
          const avatar = AVATAR_OPTIONS.find((a) => a.id === child.avatar_id) ?? AVATAR_OPTIONS[0];
          const insights = insightsByChild[i];
          return (
            <Card key={child.id}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zumi-violet-50 text-3xl">
                  {avatar.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-zumi-ink">{child.name}</p>
                  <p className="text-sm text-zumi-slate-500">
                    {child.grade ? `${child.grade} · ` : ""}Age {child.age}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="rounded-full bg-zumi-amber-400/20 px-3 py-1 font-semibold text-zumi-amber-500">
                  Level {child.level}
                </span>
                <span className="rounded-full bg-zumi-coral-500/10 px-3 py-1 font-semibold text-zumi-coral-600">
                  🔥 {child.current_streak}-day streak
                </span>
                <span className="rounded-full bg-zumi-violet-100 px-3 py-1 font-semibold text-zumi-violet-700">
                  {child.total_xp} XP
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-zumi-cloud p-3 text-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zumi-slate-500">
                  This week
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-extrabold text-zumi-ink">{insights.minutesLearned}</p>
                    <p className="text-xs text-zumi-slate-500">min learned</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-zumi-ink">{insights.activitiesCompleted}</p>
                    <p className="text-xs text-zumi-slate-500">activities</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-zumi-ink">{insights.accuracy}%</p>
                    <p className="text-xs text-zumi-slate-500">accuracy</p>
                  </div>
                </div>
                {insights.strongest ? (
                  <p className="mt-2 text-xs text-zumi-mint-500">
                    Improving: <span className="font-semibold">{insights.strongest.name}</span>
                  </p>
                ) : null}
                {insights.weakest ? (
                  <p className="mt-1 text-xs text-zumi-coral-600">
                    Needs practice: <span className="font-semibold">{insights.weakest.name}</span>
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/parent/practice/new?child=${child.id}`} className="flex-1">
                  <Button className="w-full">Create Practice</Button>
                </Link>
                <Link href={`/child/${child.id}/dashboard`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    View as child
                  </Button>
                </Link>
                <Link href={`/parent/reports/${child.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full">
                    Reports
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
