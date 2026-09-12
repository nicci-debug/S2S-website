"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, FieldError } from "@/components/ui/Field";
import { createSkillAction, type AdminFormState } from "./actions";

const initialState: AdminFormState = {};

export function CreateSkillForm({ subjects }: { subjects: Array<{ id: string; name: string }> }) {
  const [state, formAction, isPending] = useActionState(createSkillAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-6 sm:items-end">
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="subjectId">Subject</FieldLabel>
        <Select id="subjectId" name="subjectId" required>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <FieldLabel htmlFor="code">Code</FieldLabel>
        <Input id="code" name="code" required />
      </div>
      <div>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" name="name" required />
      </div>
      <div>
        <FieldLabel htmlFor="minAge">Min age</FieldLabel>
        <Input id="minAge" name="minAge" type="number" min={4} max={14} defaultValue={6} required />
      </div>
      <div>
        <FieldLabel htmlFor="maxAge">Max age</FieldLabel>
        <Input id="maxAge" name="maxAge" type="number" min={4} max={14} defaultValue={12} required />
      </div>
      <div className="sm:col-span-6 flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add skill"}
        </Button>
        <FieldError>{state.error}</FieldError>
      </div>
    </form>
  );
}
