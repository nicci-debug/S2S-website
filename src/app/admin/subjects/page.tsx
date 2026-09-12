import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreateSubjectForm } from "./CreateSubjectForm";
import { toggleSubjectActiveAction } from "./actions";

export const metadata: Metadata = { title: "Subjects — Zumi admin" };

export default async function AdminSubjectsPage() {
  const { supabase } = await requireAdminSession();
  const { data: subjects } = await supabase.from("subjects").select("*").order("sort_order");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Subjects</h1>

      <Card className="mb-6">
        <CreateSubjectForm />
      </Card>

      <div className="space-y-2">
        {(subjects ?? []).map((subject) => (
          <Card key={subject.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-bold text-zumi-ink">
                {subject.name} <span className="text-xs text-zumi-slate-500">({subject.code})</span>
              </p>
              {subject.description ? (
                <p className="text-sm text-zumi-slate-500">{subject.description}</p>
              ) : null}
            </div>
            <form action={toggleSubjectActiveAction.bind(null, subject.id, subject.is_active)}>
              <Button type="submit" variant={subject.is_active ? "secondary" : "primary"} size="md">
                {subject.is_active ? "Active" : "Inactive"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
