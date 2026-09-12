import { z } from "zod";
import { activityTypeSchema, questionDataSchema } from "@/lib/activity-schema";

export const practiceSetDraftSchema = z.object({
  childId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().trim().min(1, "Give this practice a title").max(120),
  usedAi: z.boolean().optional(),
  sourceInput: z.string().max(4000).optional(),
  activities: z
    .array(
      z.object({
        type: activityTypeSchema,
        title: z.string().trim().min(1).max(120),
        instructions: z.string().max(500).optional(),
        questions: z.array(questionDataSchema).min(1, "Add at least one question"),
      }),
    )
    .min(1, "Add at least one activity"),
});

export type PracticeSetDraft = z.infer<typeof practiceSetDraftSchema>;
