import type { Metadata } from "next";
import Link from "next/link";
import { requireChildAccess } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Great job! — Zumi" };

export default async function RewardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ childId: string }>;
  searchParams: Promise<{ total?: string; correct?: string; xp?: string; streak?: string; badges?: string }>;
}) {
  const { childId } = await params;
  await requireChildAccess(childId);
  const sp = await searchParams;

  const total = Number(sp.total ?? 0);
  const correct = Number(sp.correct ?? 0);
  const xp = Number(sp.xp ?? 0);
  const streak = Number(sp.streak ?? 0);
  const newBadges = (sp.badges ?? "").split("|").filter(Boolean);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center pt-6 text-center">
      <p className="text-6xl">🎉</p>
      <h1 className="mt-4 text-3xl font-extrabold text-zumi-ink">Session complete!</h1>
      <p className="mt-1 text-zumi-slate-500">
        {correct} / {total} correct
      </p>

      <Card className="mt-6 w-full max-w-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-zumi-slate-500">XP earned</span>
          <span className="text-xl font-extrabold text-zumi-amber-500">+{xp}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-zumi-slate-500">Streak</span>
          <span className="text-xl font-extrabold text-zumi-coral-600">🔥 {streak} days</span>
        </div>
      </Card>

      {newBadges.length > 0 ? (
        <Card className="mt-4 w-full max-w-sm bg-zumi-amber-400/10">
          <p className="text-xs font-bold uppercase tracking-wide text-zumi-amber-500">
            New badge{newBadges.length > 1 ? "s" : ""}!
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {newBadges.map((name) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <span className="text-3xl">🏅</span>
                <span className="text-xs font-semibold text-zumi-ink">{name}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Link href={`/child/${childId}/dashboard`} className="mt-8 w-full max-w-sm">
        <Button size="lg" className="w-full">
          Back to my Zumi
        </Button>
      </Link>
    </div>
  );
}
