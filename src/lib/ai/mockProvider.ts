import type { AIProvider } from "@/lib/ai/provider";
import type { PracticeGenerationSpec } from "@/lib/ai/schema";

/**
 * Deterministic, offline, template-based generator. Used automatically
 * when no AI provider key is configured (ARCHITECTURE.md §4) so the whole
 * generation -> validation -> preview -> save pipeline is exercisable
 * without any external secret. It produces *structurally* valid,
 * template-based content — not genuinely intelligent generation — which is
 * exactly the intended trade-off for a zero-dependency fallback.
 */
export class MockProvider implements AIProvider {
  readonly name = "mock";

  async generate(spec: PracticeGenerationSpec): Promise<string> {
    const result =
      spec.subjectCode === "mathematics" ? buildMathsSet(spec) : buildWordListSet(spec);
    return JSON.stringify(result);
  }
}

function extractItems(sourceInput: string): string[] {
  return sourceInput
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildWordListSet(spec: PracticeGenerationSpec) {
  const items = extractItems(spec.sourceInput);
  const words = items.length > 0 ? items : ["word"];

  const flashCards = words.map((word) => ({
    type: "flash_cards" as const,
    front: word,
    back: `Meaning of "${word}"`,
  }));

  const spelling = words.map((word) => ({
    type: "spelling_input" as const,
    prompt: `Spell this word: "${word}"`,
    answer: word,
  }));

  const multipleChoice = words.slice(0, 4).map((word, i) => {
    const distractors = words.filter((w) => w !== word).slice(0, 3);
    while (distractors.length < 3) distractors.push(`${word}${i}x`);
    const options = shuffle([word, ...distractors]);
    return {
      type: "multiple_choice" as const,
      prompt: `Which of these is spelled correctly: "${word}"?`,
      options,
      answer: word,
    };
  });

  return {
    title: `${spec.subjectName} practice: ${words[0]}${words.length > 1 ? " & more" : ""}`,
    activities: [
      { type: "flash_cards", title: "Flash cards", questions: flashCards },
      { type: "spelling_input", title: "Spelling", questions: spelling },
      { type: "multiple_choice", title: "Quick quiz", questions: multipleChoice },
    ],
  };
}

function buildMathsSet(spec: PracticeGenerationSpec) {
  const match = spec.sourceInput.match(/(\d+)/);
  const table = match ? Number(match[1]) : 7;
  const count = Math.min(Math.max(spec.targetQuestionCount, 4), 8);

  const questions = Array.from({ length: count }, (_, i) => {
    const multiplier = i + 1;
    return {
      type: "maths_answer" as const,
      question: `${table} x ${multiplier} = ?`,
      answer: table * multiplier,
    };
  });

  return {
    title: `Mathematics practice: ${table} times table`,
    activities: [{ type: "maths_answer", title: `${table} times table`, questions }],
  };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
