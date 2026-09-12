import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { startOfWeek, endOfWeek } from "@/lib/insights";
import { getOrCreateWeeklyReport } from "@/lib/weeklyReport";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Weekly report — Zumi" };

export default async function WeeklyReportPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const { supabase, parentProfile } = await requireParentSession();

  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("id", childId)
    .eq("parent_id", parentProfile.id)
    .maybeSingle();

  if (!child) {
    notFound();
  }

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);
  const report = await getOrCreateWeeklyReport(supabase, child.id, child.name, weekStart, weekEnd);

  const [strongestSkill, weakestSkill] = await Promise.all([
    report.strongest_skill_id
      ? supabase.from("skills").select("name").eq("id", report.strongest_skill_id).maybeSingle()
      : Promise.resolve({ data: null }),
    report.weakest_skill_id
      ? supabase.from("skills").select("name").eq("id", report.weakest_skill_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zumi-ink">{child.name}&apos;s weekly report</h1>
      <p className="mt-1 text-sm text-zumi-slate-500">
        Week of {report.week_start} – {report.week_end}
      </p>

      <Card className="mt-6">
        <p className="text-zumi-ink">{report.summary_text}</p>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-zumi-cloud p-3">
            <p className="text-xl font-extrabold text-zumi-ink">{report.minutes_learned}</p>
            <p className="text-xs text-zumi-slate-500">minutes learned</p>
          </div>
          <div className="rounded-2xl bg-zumi-cloud p-3">
            <p className="text-xl font-extrabold text-zumi-ink">{report.activities_completed}</p>
            <p className="text-xs text-zumi-slate-500">activities completed</p>
          </div>
          <div className="rounded-2xl bg-zumi-cloud p-3">
            <p className="text-xl font-extrabold text-zumi-ink">{report.accuracy}%</p>
            <p className="text-xs text-zumi-slate-500">accuracy</p>
          </div>
        </div>

        {strongestSkill.data ? (
          <p className="mt-4 text-sm text-zumi-mint-500">
            <span className="font-bold">Strongest improvement:</span> {strongestSkill.data.name}
          </p>
        ) : null}
        {weakestSkill.data ? (
          <p className="mt-1 text-sm text-zumi-coral-600">
            <span className="font-bold">Needs more practice:</span> {weakestSkill.data.name}
          </p>
        ) : null}

        <p className="mt-4 rounded-2xl bg-zumi-violet-50 p-3 text-sm text-zumi-violet-700">
          <span className="font-bold">Suggested focus next week:</span> {report.recommended_focus}
        </p>
      </Card>
    </div>
  );
}
