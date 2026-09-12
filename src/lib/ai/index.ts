import { env } from "@/lib/env";
import type { AIProvider } from "@/lib/ai/provider";
import { MockProvider } from "@/lib/ai/mockProvider";
import { AnthropicProvider } from "@/lib/ai/anthropicProvider";

let cached: AIProvider | null = null;

/** Swapping the active provider is a one-line change here (ARCHITECTURE.md §4). */
export function getProvider(): AIProvider {
  if (cached) return cached;
  const apiKey = env.anthropicApiKey();
  cached = apiKey ? new AnthropicProvider(apiKey) : new MockProvider();
  return cached;
}

export type { AIProvider } from "@/lib/ai/provider";
