/**
 * Static fallbacks that mirror supabase/seed.sql. Used so pages can render
 * without a live Supabase project during development/preview, and as the
 * shape reference for what the catalogue tables are expected to contain.
 * Live pages always prefer a real DB query (see lib/catalogue.ts) — these
 * are the fallback path only.
 */

export const FALLBACK_SUBJECTS = [
  { code: "english", name: "English" },
  { code: "afrikaans", name: "Afrikaans" },
  { code: "mathematics", name: "Mathematics" },
] as const;

export const HOME_LANGUAGES = [
  { value: "en-ZA", label: "English" },
  { value: "af-ZA", label: "Afrikaans" },
  { value: "zu-ZA", label: "isiZulu" },
  { value: "xh-ZA", label: "isiXhosa" },
] as const;

export const GRADE_OPTIONS = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
] as const;

export const AVATAR_OPTIONS = [
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "owl", emoji: "🦉", label: "Owl" },
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "dolphin", emoji: "🐬", label: "Dolphin" },
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "dragon", emoji: "🐲", label: "Dragon" },
] as const;
