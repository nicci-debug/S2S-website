import type { PracticeGenerationSpec } from "@/lib/ai/schema";

/**
 * Provider abstraction (ARCHITECTURE.md §4). Every implementation returns
 * raw text that should parse as the JSON described by aiGenerationResultSchema
 * — parsing/validation/retry lives in generatePracticeSet.ts, not here, so
 * providers stay swappable without touching the validation pipeline.
 */
export interface AIProvider {
  readonly name: string;
  generate(spec: PracticeGenerationSpec, repairNotes?: string): Promise<string>;
}
