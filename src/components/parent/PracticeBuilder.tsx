"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Select, FieldError } from "@/components/ui/Field";
import { QuestionEditor } from "@/components/parent/QuestionEditor";
import { ActivityPlayer, type PlayerActivity } from "@/components/activity-engine/ActivityPlayer";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS, questionDataSchema } from "@/lib/activity-schema";
import { emptyQuestionForType, type DraftActivity } from "@/lib/activity-drafts";
import type { ActivityType } from "@/types/database";
import { createManualPracticeSetAction, type CreatePracticeState } from "@/app/parent/practice/actions";

interface ChildOption {
  id: string;
  name: string;
}
interface SubjectOption {
  id: string;
  name: string;
}

interface SkillOption {
  id: string;
  name: string;
}

interface PracticeBuilderProps {
  childOptions: ChildOption[];
  subjects: SubjectOption[];
  skillsBySubject: Record<string, SkillOption[]>;
  defaultChildId?: string;
}

const initialState: CreatePracticeState = {};

function newActivity(type: ActivityType): DraftActivity {
  return {
    tempId: crypto.randomUUID(),
    type,
    title: ACTIVITY_TYPE_LABELS[type],
    instructions: "",
    questions: [emptyQuestionForType(type)],
  };
}

export function PracticeBuilder({
  childOptions,
  subjects,
  skillsBySubject,
  defaultChildId,
}: PracticeBuilderProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createManualPracticeSetAction, initialState);

  const [childId, setChildId] = useState(defaultChildId ?? childOptions[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [activities, setActivities] = useState<DraftActivity[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [usedAi, setUsedAi] = useState(false);
  const [addType, setAddType] = useState<ActivityType>("multiple_choice");

  const validActivities = useMemo(
    () =>
      activities
        .map((activity) => ({
          ...activity,
          questions: activity.questions.filter((q) => questionDataSchema.safeParse(q).success),
        }))
        .filter((activity) => activity.questions.length > 0 && activity.title.trim().length > 0),
    [activities],
  );

  const canAssign =
    childId && subjectId && title.trim().length > 0 && validActivities.length === activities.length &&
    activities.length > 0;

  const previewActivities: PlayerActivity[] = validActivities.map((a) => ({
    id: a.tempId,
    type: a.type,
    title: a.title,
    instructions: a.instructions,
    questions: a.questions.map((data, i) => ({ id: `${a.tempId}-${i}`, data })),
  }));

  const draftJson = JSON.stringify({
    childId,
    subjectId,
    title,
    usedAi,
    sourceInput: usedAi ? aiInput : undefined,
    activities: activities.map((a) => ({
      type: a.type,
      title: a.title,
      instructions: a.instructions || undefined,
      skillId: a.skillId || undefined,
      questions: a.questions,
    })),
  });

  function updateActivity(tempId: string, next: Partial<DraftActivity>) {
    setActivities((prev) => prev.map((a) => (a.tempId === tempId ? { ...a, ...next } : a)));
  }

  function removeActivity(tempId: string) {
    setActivities((prev) => prev.filter((a) => a.tempId !== tempId));
  }

  async function generateWithAi() {
    if (!childId || !subjectId || aiInput.trim().length < 3) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/ai/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, subjectId, sourceInput: aiInput }),
      });
      const body = await response.json();
      if (!response.ok) {
        setAiError(body.error ?? "Could not generate practice content.");
        return;
      }
      const result = body.result as {
        title: string;
        activities: Array<Omit<DraftActivity, "tempId">>;
      };
      if (!title.trim()) setTitle(result.title);
      setUsedAi(true);
      setActivities((prev) => [
        ...prev,
        ...result.activities.map((a) => ({
          tempId: crypto.randomUUID(),
          type: a.type,
          title: a.title,
          instructions: a.instructions ?? "",
          questions: a.questions,
        })),
      ]);
    } catch {
      setAiError("Could not reach the AI service. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  if (previewOpen) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zumi-ink">Preview: {title || "Untitled practice"}</h2>
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            Back to edit
          </Button>
        </div>
        <ActivityPlayer activities={previewActivities} />
        <form action={formAction} className="mt-6">
          <input type="hidden" name="draft" value={draftJson} />
          <FieldError>{state.error}</FieldError>
          <Button type="submit" size="lg" className="w-full" disabled={!canAssign || isPending}>
            {isPending ? "Assigning…" : `Assign to ${childOptions.find((c) => c.id === childId)?.name ?? "child"}`}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="childId">Child</FieldLabel>
            <Select id="childId" value={childId} onChange={(e) => setChildId(e.target.value)}>
              {childOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="subjectId">Subject</FieldLabel>
            <Select id="subjectId" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Afrikaans spelling — week 4"
          />
        </div>
      </Card>

      <Card className="bg-zumi-violet-50/60">
        <FieldLabel htmlFor="aiInput" hint="e.g. a spelling list, vocab list, or a maths topic">
          Paste this week&apos;s schoolwork
        </FieldLabel>
        <textarea
          id="aiInput"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          rows={4}
          className="w-full rounded-xl border-2 border-zumi-slate-200 bg-white px-4 py-2.5 text-sm text-zumi-ink placeholder:text-zumi-slate-500 focus:border-zumi-violet-500 focus:outline-none focus:ring-4 focus:ring-zumi-violet-100"
          placeholder={"padda\nfabel\nsprokie\ngoue bal\nbelowe"}
        />
        <FieldError>{aiError ?? undefined}</FieldError>
        <Button
          type="button"
          className="mt-3"
          onClick={generateWithAi}
          disabled={aiLoading || aiInput.trim().length < 3}
        >
          {aiLoading ? "Generating…" : "Generate with AI"}
        </Button>
      </Card>

      {activities.map((activity) => (
        <Card key={activity.tempId}>
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-zumi-violet-100 px-3 py-1 text-xs font-bold text-zumi-violet-700">
              {ACTIVITY_TYPE_LABELS[activity.type]}
            </span>
            <button
              type="button"
              onClick={() => removeActivity(activity.tempId)}
              className="text-xs font-semibold text-zumi-coral-600"
            >
              Remove activity
            </button>
          </div>
          <div className="mb-3">
            <FieldLabel htmlFor={`title-${activity.tempId}`}>Activity title</FieldLabel>
            <Input
              id={`title-${activity.tempId}`}
              value={activity.title}
              onChange={(e) => updateActivity(activity.tempId, { title: e.target.value })}
            />
          </div>
          {(skillsBySubject[subjectId]?.length ?? 0) > 0 ? (
            <div className="mb-3">
              <FieldLabel htmlFor={`skill-${activity.tempId}`} hint="optional — enables progress tracking">
                Skill
              </FieldLabel>
              <Select
                id={`skill-${activity.tempId}`}
                value={activity.skillId ?? ""}
                onChange={(e) => updateActivity(activity.tempId, { skillId: e.target.value || null })}
              >
                <option value="">No specific skill</option>
                {skillsBySubject[subjectId]?.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
          <div className="space-y-3">
            {activity.questions.map((question, qIndex) => (
              <QuestionEditor
                key={qIndex}
                data={question}
                onChange={(next) => {
                  const questions = [...activity.questions];
                  questions[qIndex] = next;
                  updateActivity(activity.tempId, { questions });
                }}
                onRemove={() => {
                  const questions = activity.questions.filter((_, i) => i !== qIndex);
                  updateActivity(activity.tempId, { questions });
                }}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() =>
              updateActivity(activity.tempId, {
                questions: [...activity.questions, emptyQuestionForType(activity.type)],
              })
            }
          >
            + Add question
          </Button>
        </Card>
      ))}

      <Card className="border-2 border-dashed border-zumi-violet-200 bg-zumi-violet-50/40">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <FieldLabel htmlFor="addType">Activity type</FieldLabel>
            <Select
              id="addType"
              value={addType}
              onChange={(e) => setAddType(e.target.value as ActivityType)}
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACTIVITY_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => setActivities((prev) => [...prev, newActivity(addType)])}
          >
            + Add activity
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/parent/dashboard")}>
          Cancel
        </Button>
        <Button disabled={validActivities.length === 0} onClick={() => setPreviewOpen(true)}>
          Preview
        </Button>
      </div>
    </div>
  );
}
