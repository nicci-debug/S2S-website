import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireParentSession } from "@/lib/auth-helpers";
import { getSubjects } from "@/lib/catalogue";
import { Card } from "@/components/ui/Card";
import { ChildForm } from "@/components/parent/ChildForm";
import { createChildAction } from "./actions";

export const metadata: Metadata = { title: "Add your child — Zumi" };

export default async function OnboardingPage() {
  const { supabase, parentProfile } = await requireParentSession();

  const { count } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", parentProfile.id);

  if (count && count > 0) {
    redirect("/parent/dashboard");
  }

  const subjects = await getSubjects();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zumi-violet-50 px-4 py-12">
      <div className="mb-6 text-2xl font-extrabold text-zumi-violet-700">zumi</div>
      <Card className="w-full max-w-lg">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-zumi-coral-500">
          Step 2 of 2
        </p>
        <h1 className="text-xl font-bold text-zumi-ink">
          Welcome, {parentProfile.display_name}! Let&apos;s add your first child
        </h1>
        <p className="mt-1 text-sm text-zumi-slate-500">
          This takes a minute and helps Zumi personalise their practice from day one.
        </p>
        <div className="mt-6">
          <ChildForm action={createChildAction} subjects={subjects} submitLabel="Add child" />
        </div>
      </Card>
    </div>
  );
}
