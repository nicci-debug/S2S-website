import "server-only";
import { getProvider } from "@/lib/ai";
import {
  aiGenerationResultSchema,
  type AiGenerationResult,
  type PracticeGenerationSpec,
} from "@/lib/ai/schema";

export type GenerationOutcome =
  | { ok: true; result: AiGenerationResult }
  | { ok: false; error: string };

const MAX_ATTEMPTS = 2;

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

/**
 * Semantic checks beyond what Zod's shape/refinement rules already cover
 * (age-appropriateness, question count, language) — see ARCHITECTURE.md §4.
 * This is a deliberately simple heuristic layer for V1, not a content
 * moderation system: it rejects a small denylist and gross count mismatches
 * so obviously-wrong output never reaches a parent's preview.
 */
function semanticIssues(result: AiGenerationResult, spec: PracticeGenerationSpec): string[] {
  const issues: string[] = [];
  const totalQuestions = result.activities.reduce((n, a) => n + a.questions.length, 0);

  if (totalQuestions === 0) {
    issues.push("no questions were generated");
  }
  if (totalQuestions > spec.targetQuestionCount * 2 + 6) {
    issues.push(`too many questions generated (${totalQuestions}); keep close to ${spec.targetQuestionCount}`);
  }

  const bannedPattern = /\b(kill|hate|sex|drug|gun|weapon|violen\w*)\b/i;
  for (const activity of result.activities) {
    for (const question of activity.questions) {
      if (bannedPattern.test(JSON.stringify(question))) {
        issues.push("generated content contained a disallowed word");
      }
    }
  }

  return issues;
}

export async function generatePracticeSet(spec: PracticeGenerationSpec): Promise<GenerationOutcome> {
  const provider = getProvider();
  let repairNotes: string | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let raw: string;
    try {
      raw = await provider.generate(spec, repairNotes);
    } catch {
      return { ok: false, error: "The AI service is unavailable right now. Please try again." };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripCodeFences(raw));
    } catch {
      repairNotes = "Your response was not valid JSON.";
      continue;
    }

    const parsed = aiGenerationResultSchema.safeParse(parsedJson);
    if (!parsed.success) {
      repairNotes = `Schema validation failed: ${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`;
      continue;
    }

    const issues = semanticIssues(parsed.data, spec);
    if (issues.length > 0) {
      repairNotes = issues.join("; ");
      continue;
    }

    return { ok: true, result: parsed.data };
  }

  return {
    ok: false,
    error: "Could not generate valid practice content. Please try rephrasing your input.",
  };
}
