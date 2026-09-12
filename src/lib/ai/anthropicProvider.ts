import type { AIProvider } from "@/lib/ai/provider";
import type { PracticeGenerationSpec } from "@/lib/ai/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

/**
 * Calls the Claude Messages API server-side only — this file is never
 * imported by client code, and the API key is read from a server-only env
 * var (lib/env.ts). See ARCHITECTURE.md §4 for the full generation flow.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";

  constructor(private readonly apiKey: string) {}

  async generate(spec: PracticeGenerationSpec, repairNotes?: string): Promise<string> {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(spec, repairNotes) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${await response.text()}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text = payload.content?.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new Error("Anthropic API returned no text content");
    }

    return text;
  }
}
