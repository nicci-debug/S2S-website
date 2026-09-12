import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS entirely — server-only, and only for
 * operations that must legitimately cross parent boundaries (e.g. the
 * `handle_new_user` follow-up work, catalogue seeding tools). Never import
 * this from a Server Component or Route Handler that returns user-supplied
 * `child_id`/`parent_id` data without its own authorization check first.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
