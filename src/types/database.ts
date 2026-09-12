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

export interface UserRow {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ParentProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  locale: string;
  timezone: string;
  created_at: string;
}

export interface ChildRow {
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
}

export interface ChildLearningPriorityRow {
  child_id: string;
  subject_id: string;
  priority: number;
}

export interface SubjectRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SkillRow {
  id: string;
  subject_id: string;
  code: string;
  name: string;
  description: string | null;
  min_age: number;
  max_age: number;
  is_active: boolean;
  created_at: string;
}

export interface DifficultyLevelRow {
  id: string;
  code: string;
  label: string;
  rank: number;
}

export interface ActivityTemplateRow {
  id: string;
  subject_id: string;
  skill_id: string | null;
  activity_type: ActivityType;
  name: string;
  prompt_template: string;
  is_active: boolean;
  created_at: string;
}

export interface BadgeRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  criteria: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface PracticeSetRow {
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
}

export interface ActivityRow {
  id: string;
  practice_set_id: string;
  skill_id: string | null;
  type: ActivityType;
  title: string;
  instructions: string | null;
  difficulty_level_id: string | null;
  sort_order: number;
}

export interface QuestionRow {
  id: string;
  activity_id: string;
  data: Record<string, unknown>;
  sort_order: number;
}

export interface AssignmentRow {
  id: string;
  practice_set_id: string;
  child_id: string;
  assigned_by: string | null;
  assigned_at: string;
  due_date: string | null;
  status: AssignmentStatus;
  completed_at: string | null;
}

export interface AttemptRow {
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
}

export interface ChildSkillProgressRow {
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
}

export interface XpEventRow {
  id: string;
  child_id: string;
  amount: number;
  reason: string;
  related_assignment_id: string | null;
  created_at: string;
}

export interface StreakRow {
  id: string;
  child_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  used_freeze_at: string | null;
}

export interface ChildBadgeRow {
  id: string;
  child_id: string;
  badge_id: string;
  earned_at: string;
}

export interface WeeklyReportRow {
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
}

export interface Database {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow>; Update: Partial<UserRow> };
      parent_profiles: {
        Row: ParentProfileRow;
        Insert: Omit<ParentProfileRow, "id" | "created_at"> & { id?: string };
        Update: Partial<ParentProfileRow>;
      };
      children: {
        Row: ChildRow;
        Insert: Omit<
          ChildRow,
          "id" | "created_at" | "total_xp" | "level" | "current_streak" | "longest_streak"
        > &
          Partial<Pick<ChildRow, "total_xp" | "level" | "current_streak" | "longest_streak">>;
        Update: Partial<ChildRow>;
      };
      child_learning_priorities: {
        Row: ChildLearningPriorityRow;
        Insert: ChildLearningPriorityRow;
        Update: Partial<ChildLearningPriorityRow>;
      };
      subjects: { Row: SubjectRow; Insert: Partial<SubjectRow>; Update: Partial<SubjectRow> };
      skills: { Row: SkillRow; Insert: Partial<SkillRow>; Update: Partial<SkillRow> };
      difficulty_levels: {
        Row: DifficultyLevelRow;
        Insert: Partial<DifficultyLevelRow>;
        Update: Partial<DifficultyLevelRow>;
      };
      activity_templates: {
        Row: ActivityTemplateRow;
        Insert: Partial<ActivityTemplateRow>;
        Update: Partial<ActivityTemplateRow>;
      };
      badges: { Row: BadgeRow; Insert: Partial<BadgeRow>; Update: Partial<BadgeRow> };
      practice_sets: {
        Row: PracticeSetRow;
        Insert: Omit<PracticeSetRow, "id" | "created_at">;
        Update: Partial<PracticeSetRow>;
      };
      activities: {
        Row: ActivityRow;
        Insert: Omit<ActivityRow, "id">;
        Update: Partial<ActivityRow>;
      };
      questions: {
        Row: QuestionRow;
        Insert: Omit<QuestionRow, "id">;
        Update: Partial<QuestionRow>;
      };
      assignments: {
        Row: AssignmentRow;
        Insert: Omit<AssignmentRow, "id" | "assigned_at">;
        Update: Partial<AssignmentRow>;
      };
      attempts: {
        Row: AttemptRow;
        Insert: Omit<AttemptRow, "id" | "attempted_at">;
        Update: Partial<AttemptRow>;
      };
      child_skill_progress: {
        Row: ChildSkillProgressRow;
        Insert: Omit<ChildSkillProgressRow, "id" | "updated_at">;
        Update: Partial<ChildSkillProgressRow>;
      };
      xp_events: {
        Row: XpEventRow;
        Insert: Omit<XpEventRow, "id" | "created_at">;
        Update: Partial<XpEventRow>;
      };
      streaks: { Row: StreakRow; Insert: Omit<StreakRow, "id">; Update: Partial<StreakRow> };
      child_badges: {
        Row: ChildBadgeRow;
        Insert: Omit<ChildBadgeRow, "id" | "earned_at">;
        Update: Partial<ChildBadgeRow>;
      };
      weekly_reports: {
        Row: WeeklyReportRow;
        Insert: Omit<WeeklyReportRow, "id" | "created_at">;
        Update: Partial<WeeklyReportRow>;
      };
    };
  };
}
