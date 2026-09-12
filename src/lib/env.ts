/**
 * Central place that reads env vars. Throws a clear error at the point of
 * use (not at import time) so pages that don't need Supabase/AI can still
 * render — important for this MVP running without a provisioned project.
 */

function readServer(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server env var: ${name}`);
  }
  return value;
}

export const env = {
  supabaseUrl: () => readServer("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => readServer("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => readServer("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicApiKey: (): string | undefined => process.env.ANTHROPIC_API_KEY,
  isSupabaseConfigured: (): boolean =>
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
