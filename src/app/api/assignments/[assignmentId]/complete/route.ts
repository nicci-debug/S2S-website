import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completeSession } from "@/lib/xp";

/**
 * Marks an assignment completed and awards session-complete XP, updates
 * the streak, and evaluates badges (lib/xp.ts) — the gamification layer on
 * top of Phase 8's plain "did the child finish" tracking.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const { assignmentId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, child_id, children(parent_profiles(user_id))")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment || assignment.children?.parent_profiles?.user_id !== user.id) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("assignments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", assignmentId);

  if (error) {
    return NextResponse.json({ error: "Could not complete assignment." }, { status: 500 });
  }

  const summary = await completeSession(supabase, assignment.child_id, assignmentId);

  return NextResponse.json(summary);
}
