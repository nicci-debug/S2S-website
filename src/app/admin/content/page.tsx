import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { archivePracticeSetAction } from "./actions";

export const metadata: Metadata = { title: "AI content — Zumi admin" };

export default async function AdminContentPage() {
  const { supabase } = await requireAdminSession();
  const { data: practiceSets } = await supabase
    .from("practice_sets")
    .select("id, title, status, source_input, created_at, subjects(name)")
    .eq("source_type", "ai")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zumi-ink">AI-generated content</h1>
      <p className="mb-6 text-sm text-zumi-slate-500">
        Every practice set created via &quot;Generate with AI&quot;, newest first — for moderation.
      </p>

      {!practiceSets || practiceSets.length === 0 ? (
        <Card>
          <p className="text-zumi-slate-500">No AI-generated content yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {practiceSets.map((set) => (
            <Card key={set.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-zumi-ink">{set.title}</p>
                  <p className="text-xs text-zumi-slate-500">
                    {set.subjects?.name} · {new Date(set.created_at).toLocaleDateString()} ·{" "}
                    <span className="uppercase">{set.status}</span>
                  </p>
                  {set.source_input ? (
                    <p className="mt-2 truncate text-sm text-zumi-slate-500">
                      &quot;{set.source_input}&quot;
                    </p>
                  ) : null}
                </div>
                {set.status !== "archived" ? (
                  <form action={archivePracticeSetAction.bind(null, set.id)}>
                    <Button type="submit" variant="secondary" size="md">
                      Archive
                    </Button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
