import { createElement } from "react";
import type { QuestionData } from "@/lib/activity-schema";
import type { GivenAnswer } from "@/lib/grading";
import { getRendererForType } from "./registry";

interface ActivityRendererProps {
  data: QuestionData;
  onAnswer: (given: GivenAnswer) => void;
  answered: boolean;
  isCorrect: boolean | null;
}

/**
 * The activity engine's single dispatch point: looks up `data.type` in the
 * registry and renders that component. No activity type is ever
 * hardcoded into a page — this is the only place a `type` switch happens.
 */
export function ActivityRenderer({ data, onAnswer, answered, isCorrect }: ActivityRendererProps) {
  const Renderer = getRendererForType(data.type);
  return createElement(Renderer, { data, onAnswer, answered, isCorrect });
}
