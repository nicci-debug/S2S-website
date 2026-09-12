import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { CreateDifficultyLevelForm } from "./CreateDifficultyLevelForm";

export const metadata: Metadata = { title: "Difficulty levels — Zumi admin" };

export default async function AdminDifficultyLevelsPage() {
  const { supabase } = await requireAdminSession();
  const { data: levels } = await supabase.from("difficulty_levels").select("*").order("rank");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Difficulty levels</h1>

      <Card className="mb-6">
        <CreateDifficultyLevelForm />
      </Card>

      <div className="space-y-2">
        {(levels ?? []).map((level) => (
          <Card key={level.id} className="flex items-center justify-between py-4">
            <p className="font-bold text-zumi-ink">
              {level.label} <span className="text-xs text-zumi-slate-500">({level.code})</span>
            </p>
            <span className="rounded-full bg-zumi-violet-100 px-3 py-1 text-xs font-bold text-zumi-violet-700">
              rank {level.rank}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
