"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, FieldError } from "@/components/ui/Field";
import { createDifficultyLevelAction, type AdminFormState } from "./actions";

const initialState: AdminFormState = {};

export function CreateDifficultyLevelForm() {
  const [state, formAction, isPending] = useActionState(createDifficultyLevelAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div>
        <FieldLabel htmlFor="code">Code</FieldLabel>
        <Input id="code" name="code" placeholder="e.g. expert" required />
      </div>
      <div>
        <FieldLabel htmlFor="label">Label</FieldLabel>
        <Input id="label" name="label" placeholder="e.g. Expert" required />
      </div>
      <div>
        <FieldLabel htmlFor="rank">Rank</FieldLabel>
        <Input id="rank" name="rank" type="number" min={1} required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add level"}
      </Button>
      <div className="sm:col-span-4">
        <FieldError>{state.error}</FieldError>
      </div>
    </form>
  );
}
