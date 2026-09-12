import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { getSubjects, getSkillsBySubject } from "@/lib/catalogue";
import { PracticeBuilder } from "@/components/parent/PracticeBuilder";

export const metadata: Metadata = { title: "Create Practice — Zumi" };

export default async function NewPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  const { supabase, parentProfile } = await requireParentSession();

  const [{ data: children }, subjects, skillsBySubject] = await Promise.all([
    supabase
      .from("children")
      .select("id, name")
      .eq("parent_id", parentProfile.id)
      .order("created_at"),
    getSubjects(),
    getSkillsBySubject(),
  ]);

  if (!children || children.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-zumi-ink">Create Practice</h1>
      <p className="mb-6 text-zumi-slate-500">
        Build activities from this week&apos;s schoolwork and assign them to your child.
      </p>
      <PracticeBuilder
        childOptions={children}
        subjects={subjects}
        skillsBySubject={skillsBySubject}
        defaultChildId={child}
      />
    </div>
  );
}
