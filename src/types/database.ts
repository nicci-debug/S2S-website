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

/** Matches postgrest-js's `GenericRelationship` shape. */
type Rel<
  FK extends string,
  Cols extends string[],
  Ref extends string,
  RefCols extends string[],
> = {
  foreignKeyName: FK;
  columns: Cols;
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: RefCols;
};

/** Shorthand matching postgrest-js's `GenericTable` shape (adds `Relationships`). */
type Table<Row, Insert, Update = Partial<Row>, Relationships extends unknown[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export interface Database {
  public: {
    Tables: {
      users: Table<UserRow, Partial<UserRow>>;
      parent_profiles: Table<
        ParentProfileRow,
        Omit<ParentProfileRow, "id" | "created_at" | "locale" | "timezone"> &
          Partial<Pick<ParentProfileRow, "id" | "locale" | "timezone">>,
        Partial<ParentProfileRow>,
        [Rel<"parent_profiles_user_id_fkey", ["user_id"], "users", ["id"]>]
      >;
      children: Table<
        ChildRow,
        Omit<
          ChildRow,
          "id" | "created_at" | "total_xp" | "level" | "current_streak" | "longest_streak"
        > &
          Partial<Pick<ChildRow, "total_xp" | "level" | "current_streak" | "longest_streak">>,
        Partial<ChildRow>,
        [Rel<"children_parent_id_fkey", ["parent_id"], "parent_profiles", ["id"]>]
      >;
      child_learning_priorities: Table<
        ChildLearningPriorityRow,
        ChildLearningPriorityRow,
        Partial<ChildLearningPriorityRow>,
        [
          Rel<"child_learning_priorities_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"child_learning_priorities_subject_id_fkey", ["subject_id"], "subjects", ["id"]>,
        ]
      >;
      subjects: Table<SubjectRow, Partial<SubjectRow>>;
      skills: Table<
        SkillRow,
        Partial<SkillRow>,
        Partial<SkillRow>,
        [Rel<"skills_subject_id_fkey", ["subject_id"], "subjects", ["id"]>]
      >;
      difficulty_levels: Table<DifficultyLevelRow, Partial<DifficultyLevelRow>>;
      activity_templates: Table<
        ActivityTemplateRow,
        Partial<ActivityTemplateRow>,
        Partial<ActivityTemplateRow>,
        [
          Rel<"activity_templates_subject_id_fkey", ["subject_id"], "subjects", ["id"]>,
          Rel<"activity_templates_skill_id_fkey", ["skill_id"], "skills", ["id"]>,
        ]
      >;
      badges: Table<BadgeRow, Partial<BadgeRow>>;
      practice_sets: Table<
        PracticeSetRow,
        Omit<PracticeSetRow, "id" | "created_at">,
        Partial<PracticeSetRow>,
        [
          Rel<"practice_sets_parent_id_fkey", ["parent_id"], "parent_profiles", ["id"]>,
          Rel<"practice_sets_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"practice_sets_subject_id_fkey", ["subject_id"], "subjects", ["id"]>,
        ]
      >;
      activities: Table<
        ActivityRow,
        Omit<ActivityRow, "id">,
        Partial<ActivityRow>,
        [
          Rel<"activities_practice_set_id_fkey", ["practice_set_id"], "practice_sets", ["id"]>,
          Rel<"activities_skill_id_fkey", ["skill_id"], "skills", ["id"]>,
          Rel<
            "activities_difficulty_level_id_fkey",
            ["difficulty_level_id"],
            "difficulty_levels",
            ["id"]
          >,
        ]
      >;
      questions: Table<
        QuestionRow,
        Omit<QuestionRow, "id">,
        Partial<QuestionRow>,
        [Rel<"questions_activity_id_fkey", ["activity_id"], "activities", ["id"]>]
      >;
      assignments: Table<
        AssignmentRow,
        Omit<AssignmentRow, "id" | "assigned_at">,
        Partial<AssignmentRow>,
        [
          Rel<"assignments_practice_set_id_fkey", ["practice_set_id"], "practice_sets", ["id"]>,
          Rel<"assignments_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"assignments_assigned_by_fkey", ["assigned_by"], "parent_profiles", ["id"]>,
        ]
      >;
      attempts: Table<
        AttemptRow,
        Omit<AttemptRow, "id" | "attempted_at">,
        Partial<AttemptRow>,
        [
          Rel<"attempts_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"attempts_assignment_id_fkey", ["assignment_id"], "assignments", ["id"]>,
          Rel<"attempts_activity_id_fkey", ["activity_id"], "activities", ["id"]>,
          Rel<"attempts_question_id_fkey", ["question_id"], "questions", ["id"]>,
          Rel<"attempts_skill_id_fkey", ["skill_id"], "skills", ["id"]>,
        ]
      >;
      child_skill_progress: Table<
        ChildSkillProgressRow,
        Omit<ChildSkillProgressRow, "id" | "updated_at">,
        Partial<ChildSkillProgressRow>,
        [
          Rel<"child_skill_progress_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"child_skill_progress_skill_id_fkey", ["skill_id"], "skills", ["id"]>,
        ]
      >;
      xp_events: Table<
        XpEventRow,
        Omit<XpEventRow, "id" | "created_at">,
        Partial<XpEventRow>,
        [Rel<"xp_events_child_id_fkey", ["child_id"], "children", ["id"]>]
      >;
      streaks: Table<
        StreakRow,
        Omit<StreakRow, "id">,
        Partial<StreakRow>,
        [Rel<"streaks_child_id_fkey", ["child_id"], "children", ["id"]>]
      >;
      child_badges: Table<
        ChildBadgeRow,
        Omit<ChildBadgeRow, "id" | "earned_at">,
        Partial<ChildBadgeRow>,
        [
          Rel<"child_badges_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"child_badges_badge_id_fkey", ["badge_id"], "badges", ["id"]>,
        ]
      >;
      weekly_reports: Table<
        WeeklyReportRow,
        Omit<WeeklyReportRow, "id" | "created_at">,
        Partial<WeeklyReportRow>,
        [
          Rel<"weekly_reports_child_id_fkey", ["child_id"], "children", ["id"]>,
          Rel<"weekly_reports_strongest_skill_id_fkey", ["strongest_skill_id"], "skills", ["id"]>,
          Rel<"weekly_reports_weakest_skill_id_fkey", ["weakest_skill_id"], "skills", ["id"]>,
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
