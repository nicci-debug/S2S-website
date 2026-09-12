import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseQuestionData } from "@/lib/activity-schema";
import { gradeAnswer, type GivenAnswer } from "@/lib/grading";
import { applyAttemptToProgress } from "@/lib/adaptive";

const givenAnswerSchema = z.union([
  z.object({ kind: z.literal("text"), value: z.string() }),
  z.object({ kind: z.literal("number"), value: z.number() }),
  z.object({ kind: z.literal("boolean"), value: z.boolean() }),
  z.object({ kind: z.literal("words"), value: z.array(z.string()) }),
  z.object({
    kind: z.literal("pairs"),
    value: z.array(z.object({ left: z.string(), right: z.string() })),
  }),
  z.object({ kind: z.literal("reviewed"), value: z.boolean() }),
]) satisfies z.ZodType<GivenAnswer>;

const requestSchema = z.object({
  childId: z.string().min(1),
  assignmentId: z.string().min(1).nullable().optional(),
  activityId: z.string().min(1),
  questionId: z.string().min(1),
  given: givenAnswerSchema,
});

/**
 * Records one attempt and updates skill-level progress
 * (child_skill_progress). Correctness is re-derived server-side from the
 * stored question data via lib/grading — the client's own `isCorrect` is
 * used only for its own immediate UI feedback and is never trusted here,
 * since XP/mastery both build on this value (Phase 9).
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { childId, assignmentId, activityId, questionId, given } = parsed.data;

  const { data: child } = await supabase
    .from("children")
    .select("id, parent_profiles(user_id)")
    .eq("id", childId)
    .maybeSingle();

  if (!child || child.parent_profiles?.user_id !== user.id) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const { data: question } = await supabase
    .from("questions")
    .select("id, data, activity_id, activities(skill_id)")
    .eq("id", questionId)
    .eq("activity_id", activityId)
    .maybeSingle();

  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  const questionData = parseQuestionData(question.data);
  if (!questionData) {
    return NextResponse.json({ error: "Question data is invalid." }, { status: 422 });
  }

  const isCorrect = gradeAnswer(questionData, given);
  if (isCorrect === null) {
    return NextResponse.json({ error: "Answer does not match question type." }, { status: 400 });
  }

  const skillId = question.activities?.skill_id ?? null;

  const { error: attemptError } = await supabase.from("attempts").insert({
    child_id: childId,
    assignment_id: assignmentId ?? null,
    activity_id: activityId,
    question_id: questionId,
    skill_id: skillId,
    given_answer: given,
    is_correct: isCorrect,
    time_taken_ms: null,
  });

  if (attemptError) {
    return NextResponse.json({ error: "Could not record attempt." }, { status: 500 });
  }

  if (skillId) {
    const { data: existing } = await supabase
      .from("child_skill_progress")
      .select("*")
      .eq("child_id", childId)
      .eq("skill_id", skillId)
      .maybeSingle();

    const now = new Date();
    const updated = applyAttemptToProgress(
      {
        attemptsCount: existing?.attempts_count ?? 0,
        correctCount: existing?.correct_count ?? 0,
        incorrectCount: existing?.incorrect_count ?? 0,
        masteryScore: existing?.mastery_score ?? 0,
        reviewStep: existing?.review_step ?? 0,
      },
      isCorrect,
      now,
    );

    await supabase.from("child_skill_progress").upsert(
      {
        child_id: childId,
        skill_id: skillId,
        attempts_count: updated.attemptsCount,
        correct_count: updated.correctCount,
        incorrect_count: updated.incorrectCount,
        accuracy: updated.accuracy,
        mastery_score: updated.masteryScore,
        review_step: updated.reviewStep,
        last_practised_at: now.toISOString(),
        next_review_at: updated.nextReviewAt,
      },
      { onConflict: "child_id,skill_id" },
    );
  }

  return NextResponse.json({ isCorrect });
}
