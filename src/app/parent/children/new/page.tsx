import type { Metadata } from "next";
import { getSubjects } from "@/lib/catalogue";
import { Card } from "@/components/ui/Card";
import { ChildForm } from "@/components/parent/ChildForm";
import { addChildAction } from "../actions";

export const metadata: Metadata = { title: "Add a child — Zumi" };

export default async function NewChildPage() {
  const subjects = await getSubjects();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Add a child</h1>
      <Card>
        <ChildForm action={addChildAction} subjects={subjects} submitLabel="Add child" />
      </Card>
    </div>
  );
}
