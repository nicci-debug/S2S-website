"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

export interface AuthActionState {
  error?: string;
  info?: string;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  const { displayName, email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Something went wrong creating your account. Please try again." };
  }

  // Create the parent profile immediately with the service-role client so
  // onboarding has somewhere to attach a child even before email
  // confirmation completes (if the project requires it).
  const admin = createSupabaseAdminClient();
  const { error: profileError } = await admin
    .from("parent_profiles")
    .insert({ user_id: data.user.id, display_name: displayName });

  if (profileError && !profileError.message.includes("duplicate")) {
    return { error: "Your account was created, but we couldn't finish setup. Please log in." };
  }

  if (!data.session) {
    return {
      info: "Check your email to confirm your account, then log in to continue.",
    };
  }

  redirect("/onboarding");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/parent/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
