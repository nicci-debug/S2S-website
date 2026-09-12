import "server-only";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ChildRow, ParentProfileRow, UserRow } from "@/types/database";

/**
 * Ensures a parent_profiles row exists for this auth user. Signup already
 * creates one (see app/(auth)/actions.ts); this is a defensive fallback for
 * accounts created before that logic existed, or via Supabase directly.
 */
export async function getOrCreateParentProfile(
  userId: string,
  displayNameFallback: string,
): Promise<ParentProfileRow> {
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("parent_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const admin = createSupabaseAdminClient();
  const { data: created, error } = await admin
    .from("parent_profiles")
    .insert({ user_id: userId, display_name: displayNameFallback })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(`Could not create parent profile: ${error?.message ?? "unknown error"}`);
  }

  return created;
}

/**
 * Server-side guard for every /parent/** route. Redirects to /login when
 * unauthenticated. Does not redirect based on child count — pages that
 * care (e.g. dashboard) check that themselves so this stays a single,
 * predictable gate.
 */
export async function requireParentSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parentProfile = await getOrCreateParentProfile(
    user.id,
    user.email?.split("@")[0] ?? "Parent",
  );

  return { supabase, user, parentProfile };
}

/**
 * Guard for every /child/[childId]/** route. The child never authenticates
 * directly in V1 — this runs inside the parent's session and 404s (rather
 * than redirecting, to avoid leaking whether a childId exists) if the
 * child doesn't belong to the signed-in parent.
 */
export async function requireChildAccess(childId: string): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  parentProfile: ParentProfileRow;
  child: ChildRow;
}> {
  const { supabase, parentProfile } = await requireParentSession();

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", parentProfile.id)
    .maybeSingle();

  if (!child) {
    notFound();
  }

  return { supabase, parentProfile, child };
}

/**
 * Guard for every /admin/** route. Admin status is `users.role === 'admin'`
 * — there is no self-service way to become an admin (see README.md); it is
 * granted by updating that column directly in the database. Redirects to
 * `/` (not a 404) so a signed-in non-admin gets a clear "not for you"
 * rather than a broken link.
 */
export async function requireAdminSession(): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  appUser: UserRow;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appUser } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();

  if (!appUser || appUser.role !== "admin") {
    redirect("/");
  }

  return { supabase, appUser };
}
