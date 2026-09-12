import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Marks an assignment completed. XP/streak/badge awarding is layered on
 * top of this in Phase 9 — this route only owns the progress-tracking
 * concern (did the child finish the session) for Phase 8.
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
    .select("id, children(parent_profiles(user_id))")
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

  return NextResponse.json({ ok: true });
}
