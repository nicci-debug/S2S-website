import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreateSkillForm } from "./CreateSkillForm";
import { toggleSkillActiveAction } from "./actions";

export const metadata: Metadata = { title: "Skills — Zumi admin" };

export default async function AdminSkillsPage() {
  const { supabase } = await requireAdminSession();
  const [{ data: subjects }, { data: skills }] = await Promise.all([
    supabase.from("subjects").select("id, name").order("sort_order"),
    supabase.from("skills").select("*, subjects(name)").order("subject_id"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Skills</h1>

      <Card className="mb-6">
        <CreateSkillForm subjects={subjects ?? []} />
      </Card>

      <div className="space-y-2">
        {(skills ?? []).map((skill) => (
          <Card key={skill.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-bold text-zumi-ink">
                {skill.name}{" "}
                <span className="text-xs text-zumi-slate-500">
                  ({skill.subjects?.name} · {skill.code} · ages {skill.min_age}-{skill.max_age})
                </span>
              </p>
            </div>
            <form action={toggleSkillActiveAction.bind(null, skill.id, skill.is_active)}>
              <Button type="submit" variant={skill.is_active ? "secondary" : "primary"} size="md">
                {skill.is_active ? "Active" : "Inactive"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
