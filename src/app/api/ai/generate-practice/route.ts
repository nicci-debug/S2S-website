import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateParentProfile } from "@/lib/auth-helpers";
import { generatePracticeSet } from "@/lib/ai/generatePracticeSet";

const requestSchema = z.object({
  childId: z.string().min(1),
  subjectId: z.string().min(1),
  sourceInput: z.string().trim().min(3).max(4000),
  questionCount: z.coerce.number().int().min(2).max(20).optional(),
});

/**
 * Parent input -> backend -> AI generation service -> structured JSON ->
 * validation -> (returned to browser for preview, not yet persisted) ->
 * saved only once the parent assigns it (ARCHITECTURE.md §4). This route
 * never talks to an LLM provider directly from the browser and never
 * persists anything itself.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parentProfile = await getOrCreateParentProfile(
    user.id,
    user.email?.split("@")[0] ?? "Parent",
  );

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { childId, subjectId, sourceInput, questionCount } = parsed.data;

  const { data: child } = await supabase
    .from("children")
    .select("id, age, home_language")
    .eq("id", childId)
    .eq("parent_id", parentProfile.id)
    .maybeSingle();

  if (!child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, code, name")
    .eq("id", subjectId)
    .maybeSingle();

  if (!subject) {
    return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  }

  const outcome = await generatePracticeSet({
    subjectName: subject.name,
    subjectCode: subject.code,
    sourceInput,
    childAge: child.age,
    homeLanguage: child.home_language,
    targetQuestionCount: questionCount ?? 6,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 422 });
  }

  return NextResponse.json({ result: outcome.result });
}
