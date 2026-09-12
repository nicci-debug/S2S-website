"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, FieldError } from "@/components/ui/Field";
import { AVATAR_OPTIONS, GRADE_OPTIONS, HOME_LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface SubjectOption {
  id: string;
  name: string;
}

interface ChildFormState {
  error?: string;
}

interface ChildFormProps {
  action: (state: ChildFormState, formData: FormData) => Promise<ChildFormState>;
  subjects: SubjectOption[];
  submitLabel: string;
}

const initialState: ChildFormState = {};

export function ChildForm({ action, subjects, submitLabel }: ChildFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [avatarId, setAvatarId] = useState<string>(AVATAR_OPTIONS[0].id);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <FieldLabel htmlFor="name">Child&apos;s name</FieldLabel>
        <Input id="name" name="name" required maxLength={60} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="age">Age</FieldLabel>
          <Input id="age" name="age" type="number" min={4} max={14} required />
        </div>
        <div>
          <FieldLabel htmlFor="grade">Grade</FieldLabel>
          <Select id="grade" name="grade" defaultValue="">
            <option value="">Select grade</option>
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="homeLanguage">Home language</FieldLabel>
        <Select id="homeLanguage" name="homeLanguage" defaultValue={HOME_LANGUAGES[0].value}>
          {HOME_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <FieldLabel htmlFor="avatarId">Choose an avatar</FieldLabel>
        <input type="hidden" name="avatarId" value={avatarId} />
        <div className="flex flex-wrap gap-3">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              type="button"
              key={avatar.id}
              onClick={() => setAvatarId(avatar.id)}
              aria-pressed={avatarId === avatar.id}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all",
                avatarId === avatar.id
                  ? "bg-zumi-violet-100 ring-2 ring-zumi-violet-500"
                  : "bg-zumi-violet-50 hover:bg-zumi-violet-100",
              )}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="subjectIds" hint="Pick your top priority first">
          Subjects to practise
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => {
            const checked = selectedSubjects.includes(subject.id);
            return (
              <label
                key={subject.id}
                className={cn(
                  "cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all",
                  checked
                    ? "border-zumi-violet-500 bg-zumi-violet-500 text-white"
                    : "border-zumi-slate-200 bg-white text-zumi-ink hover:border-zumi-violet-300",
                )}
              >
                <input
                  type="checkbox"
                  name="subjectIds"
                  value={subject.id}
                  checked={checked}
                  onChange={() => toggleSubject(subject.id)}
                  className="sr-only"
                />
                {subject.name}
                {checked ? ` · ${selectedSubjects.indexOf(subject.id) + 1}` : ""}
              </label>
            );
          })}
        </div>
      </div>

      <FieldError>{state.error}</FieldError>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
