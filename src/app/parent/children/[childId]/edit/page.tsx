import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { getSubjects } from "@/lib/catalogue";
import { Card } from "@/components/ui/Card";
import { ChildForm } from "@/components/parent/ChildForm";
import { editChildAction } from "../../actions";

export const metadata: Metadata = { title: "Edit child — Zumi" };

export default async function EditChildPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const { supabase, parentProfile } = await requireParentSession();

  const { data: child } = await supabase
    .from("children")
    .select("id, name, age, grade, home_language, avatar_id")
    .eq("id", childId)
    .eq("parent_id", parentProfile.id)
    .maybeSingle();

  if (!child) {
    notFound();
  }

  const [subjects, { data: priorities }] = await Promise.all([
    getSubjects(),
    supabase
      .from("child_learning_priorities")
      .select("subject_id")
      .eq("child_id", childId)
      .order("priority"),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Edit {child.name}</h1>
      <Card>
        <ChildForm
          action={editChildAction}
          subjects={subjects}
          submitLabel="Save changes"
          hiddenFields={{ childId: child.id }}
          defaultValues={{
            name: child.name,
            age: child.age,
            grade: child.grade ?? "",
            homeLanguage: child.home_language,
            avatarId: child.avatar_id,
            subjectIds: (priorities ?? []).map((p) => p.subject_id),
          }}
        />
      </Card>
    </div>
  );
}
