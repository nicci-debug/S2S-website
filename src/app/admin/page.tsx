import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { startOfWeek } from "@/lib/insights";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Admin overview — Zumi" };

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdminSession();
  const weekStart = startOfWeek(new Date()).toISOString();

  const [parents, children, practiceSets, sessionsThisWeek, aiGenerated] = await Promise.all([
    supabase.from("parent_profiles").select("id", { count: "exact", head: true }),
    supabase.from("children").select("id", { count: "exact", head: true }),
    supabase.from("practice_sets").select("id", { count: "exact", head: true }),
    supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", weekStart),
    supabase.from("practice_sets").select("id", { count: "exact", head: true }).eq("source_type", "ai"),
  ]);

  const stats = [
    { label: "Parent accounts", value: parents.count ?? 0 },
    { label: "Child profiles", value: children.count ?? 0 },
    { label: "Practice sets created", value: practiceSets.count ?? 0 },
    { label: "Sessions completed this week", value: sessionsThisWeek.count ?? 0 },
    { label: "AI-generated practice sets", value: aiGenerated.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Platform overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-3xl font-extrabold text-zumi-violet-700">{stat.value}</p>
            <p className="mt-1 text-sm text-zumi-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs text-zumi-slate-500">
        Aggregate counts only — no per-child or per-parent identifying data is shown here, per
        PRODUCT.md&apos;s safety &amp; privacy rules.
      </p>
    </div>
  );
}
