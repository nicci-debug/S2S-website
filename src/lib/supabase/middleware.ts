import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Refreshes the Supabase auth session cookie on every request. Route-level
 * redirects (parent/child/admin gating) still happen in each layout — this
 * only keeps the session alive.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!env.isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient<Database>(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
