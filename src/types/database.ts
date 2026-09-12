/**
 * Hand-written row types matching supabase/migrations. Kept in sync
 * manually in V1 (see IMPLEMENTATION_PLAN.md follow-ups for switching to
 * `supabase gen types` once a project ref exists).
 */

export type UserRole = "parent" | "admin";

export type ActivityType =
  | "multiple_choice"
  | "match_pairs"
  | "flash_cards"
  | "fill_in_the_blank"
  | "spelling_input"
  | "true_false"
  | "unscramble_word"
  | "maths_answer"
  | "translation"
  | "sentence_building";

export type PracticeSetSourceType = "manual" | "ai" | "admin" | "upload";
export type PracticeSetStatus = "draft" | "ready" | "assigned" | "archived";
export type AssignmentStatus = "assigned" | "in_progress" | "completed";

export type UserRow = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type ParentProfileRow = {
  id: string;
  user_id: string;
  display_name: string;
  locale: string;
  timezone: string;
  created_at: string;
};

export type ChildRow = {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  grade: string | null;
  home_language: string;
  avatar_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
};

export type ChildLearningPriorityRow = {
  child_id: string;
  subject_id: string;
  priority: number;
};

export type SubjectRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type SkillRow = {
  id: string;
  subject_id: string;
  code: string;
  name: string;
  description: string | null;
  min_age: number;
  max_age: number;
  is_active: boolean;
  created_at: string;
};

export type DifficultyLevelRow = {
  id: string;
  code: string;
  label: string;
  rank: number;
};

export type ActivityTemplateRow = {
  id: string;
  subject_id: string;
  skill_id: string | null;
  activity_type: ActivityType;
  name: string;
  prompt_template: string;
  is_active: boolean;
  created_at: string;
};

export type BadgeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  criteria: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
};

export type PracticeSetRow = {
  id: string;
  parent_id: string | null;
  child_id: string | null;
  subject_id: string;
  title: string;
  source_type: PracticeSetSourceType;
  source_input: string | null;
  status: PracticeSetStatus;
  created_by: string | null;
  created_at: string;
};

export type ActivityRow = {
  id: string;
  practice_set_id: string;
  skill_id: string | null;
  type: ActivityType;
  title: string;
  instructions: string | null;
  difficulty_level_id: string | null;
  sort_order: number;
};

export type QuestionRow = {
  id: string;
  activity_id: string;
  data: Record<string, unknown>;
  sort_order: number;
};

export type AssignmentRow = {
  id: string;
  practice_set_id: string;
  child_id: string;
  assigned_by: string | null;
  assigned_at: string;
  due_date: string | null;
  status: AssignmentStatus;
  completed_at: string | null;
};

export type AttemptRow = {
  id: string;
  child_id: string;
  assignment_id: string | null;
  activity_id: string;
  question_id: string;
  skill_id: string | null;
  given_answer: unknown;
  is_correct: boolean;
  time_taken_ms: number | null;
  attempted_at: string;
};

export type ChildSkillProgressRow = {
  id: string;
  child_id: string;
  skill_id: string;
  attempts_count: number;
  correct_count: number;
  incorrect_count: number;
  accuracy: number;
  mastery_score: number;
  review_step: number;
  last_practised_at: string | null;
  next_review_at: string | null;
  updated_at: string;
};

export type XpEventRow = {
  id: string;
  child_id: string;
  amount: number;
  reason: string;
  related_assignment_id: string | null;
  created_at: string;
};

export type StreakRow = {
  id: string;
  child_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  used_freeze_at: string | null;
};

export type ChildBadgeRow = {
  id: string;
  child_id: string;
  badge_id: string;
  earned_at: string;
};

export type WeeklyReportRow = {
  id: string;
  child_id: string;
  week_start: string;
  week_end: string;
  activities_completed: number;
  minutes_learned: number;
  accuracy: number;
  strongest_skill_id: string | null;
  weakest_skill_id: string | null;
  summary_text: string;
  recommended_focus: string | null;
  created_at: string;
};

/** Shorthand matching postgrest-js's `GenericTable` shape (adds `Relationships`). */
type Table<Row, Insert, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: Table<UserRow, Partial<UserRow>>;
      parent_profiles: Table<
        ParentProfileRow,
        Omit<ParentProfileRow, "id" | "created_at" | "locale" | "timezone"> &
          Partial<Pick<ParentProfileRow, "id" | "locale" | "timezone">>
      >;
      children: Table<
        ChildRow,
        Omit<
          ChildRow,
          "id" | "created_at" | "total_xp" | "level" | "current_streak" | "longest_streak"
        > &
          Partial<Pick<ChildRow, "total_xp" | "level" | "current_streak" | "longest_streak">>
      >;
      child_learning_priorities: Table<ChildLearningPriorityRow, ChildLearningPriorityRow>;
      subjects: Table<SubjectRow, Partial<SubjectRow>>;
      skills: Table<SkillRow, Partial<SkillRow>>;
      difficulty_levels: Table<DifficultyLevelRow, Partial<DifficultyLevelRow>>;
      activity_templates: Table<ActivityTemplateRow, Partial<ActivityTemplateRow>>;
      badges: Table<BadgeRow, Partial<BadgeRow>>;
      practice_sets: Table<PracticeSetRow, Omit<PracticeSetRow, "id" | "created_at">>;
      activities: Table<ActivityRow, Omit<ActivityRow, "id">>;
      questions: Table<QuestionRow, Omit<QuestionRow, "id">>;
      assignments: Table<AssignmentRow, Omit<AssignmentRow, "id" | "assigned_at">>;
      attempts: Table<AttemptRow, Omit<AttemptRow, "id" | "attempted_at">>;
      child_skill_progress: Table<ChildSkillProgressRow, Omit<ChildSkillProgressRow, "id" | "updated_at">>;
      xp_events: Table<XpEventRow, Omit<XpEventRow, "id" | "created_at">>;
      streaks: Table<StreakRow, Omit<StreakRow, "id">>;
      child_badges: Table<ChildBadgeRow, Omit<ChildBadgeRow, "id" | "earned_at">>;
      weekly_reports: Table<WeeklyReportRow, Omit<WeeklyReportRow, "id" | "created_at">>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
