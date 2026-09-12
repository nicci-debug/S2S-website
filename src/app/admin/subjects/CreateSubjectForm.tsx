"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, FieldError } from "@/components/ui/Field";
import { createSubjectAction, type AdminFormState } from "./actions";

const initialState: AdminFormState = {};

export function CreateSubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubjectAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
      <div>
        <FieldLabel htmlFor="code">Code</FieldLabel>
        <Input id="code" name="code" placeholder="e.g. life_skills" required />
      </div>
      <div>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" name="name" placeholder="e.g. Life Skills" required />
      </div>
      <div>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Input id="description" name="description" placeholder="optional" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add subject"}
      </Button>
      <div className="sm:col-span-4">
        <FieldError>{state.error}</FieldError>
      </div>
    </form>
  );
}
