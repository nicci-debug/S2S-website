import { cn } from "@/lib/cn";

export function AnswerFeedback({ isCorrect }: { isCorrect: boolean | null }) {
  if (isCorrect === null) return null;
  return (
    <p
      className={cn(
        "mt-3 text-sm font-bold",
        isCorrect ? "text-zumi-mint-500" : "text-zumi-coral-600",
      )}
    >
      {isCorrect ? "Nice one! 🎉" : "Not quite — keep going!"}
    </p>
  );
}
