"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, FieldError } from "@/components/ui/Field";
import { createBadgeAction, type AdminFormState } from "./actions";

const initialState: AdminFormState = {};

const CRITERIA_LABELS: Record<string, string> = {
  streak: "Streak days",
  sessions_completed: "Sessions completed",
  skill_mastery: "Mastery score (%)",
  perfect_quiz: "No value needed",
};

export function CreateBadgeForm() {
  const [state, formAction, isPending] = useActionState(createBadgeAction, initialState);
  const [criteriaType, setCriteriaType] = useState("streak");

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-3">
      <div>
        <FieldLabel htmlFor="code">Code</FieldLabel>
        <Input id="code" name="code" required />
      </div>
      <div>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" name="name" required />
      </div>
      <div>
        <FieldLabel htmlFor="icon">Icon (emoji or key)</FieldLabel>
        <Input id="icon" name="icon" defaultValue="star" required />
      </div>
      <div className="sm:col-span-3">
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Input id="description" name="description" />
      </div>
      <div>
        <FieldLabel htmlFor="criteriaType">Unlock condition</FieldLabel>
        <Select
          id="criteriaType"
          name="criteriaType"
          value={criteriaType}
          onChange={(e) => setCriteriaType(e.target.value)}
        >
          <option value="streak">Streak reached</option>
          <option value="sessions_completed">Sessions completed</option>
          <option value="perfect_quiz">Perfect quiz score</option>
          <option value="skill_mastery">Skill mastery reached</option>
        </Select>
      </div>
      {criteriaType !== "perfect_quiz" ? (
        <div>
          <FieldLabel htmlFor="criteriaValue">{CRITERIA_LABELS[criteriaType]}</FieldLabel>
          <Input id="criteriaValue" name="criteriaValue" type="number" min={0} required />
        </div>
      ) : null}
      <div className="flex items-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add badge"}
        </Button>
      </div>
      <div className="sm:col-span-3">
        <FieldError>{state.error}</FieldError>
      </div>
    </form>
  );
}
