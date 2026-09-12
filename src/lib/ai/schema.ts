import { z } from "zod";
import { activityTypeSchema, questionDataSchema } from "@/lib/activity-schema";

/**
 * What a provider must return (as JSON text) for one generation request.
 * Deliberately the same activity/question shape the manual builder
 * produces (lib/validation/practiceSet.ts) minus child/subject IDs, which
 * the caller already knows — so AI-generated and manually-built content
 * flow through the exact same preview/save path (ARCHITECTURE.md §4).
 */
export const aiGenerationResultSchema = z.object({
  title: z.string().trim().min(1).max(120),
  activities: z
    .array(
      z.object({
        type: activityTypeSchema,
        title: z.string().trim().min(1).max(120),
        instructions: z.string().max(500).optional(),
        questions: z.array(questionDataSchema).min(1),
      }),
    )
    .min(1),
});

export type AiGenerationResult = z.infer<typeof aiGenerationResultSchema>;

export interface PracticeGenerationSpec {
  subjectName: string;
  subjectCode: string;
  sourceInput: string;
  childAge: number;
  homeLanguage: string;
  requestedActivityTypes?: string[];
  targetQuestionCount: number;
}
