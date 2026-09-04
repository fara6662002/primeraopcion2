import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const ADMIN_EMAIL = 'fararuiz64@gmail.com';

// ---- Types matching the database schema ----

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  approved: boolean;
  blocked: boolean;
  device_fingerprint: string | null;
  avatar: string | null;
  expires_at: string | null;
  last_login_at: string | null;
  status: string;
  created_at: string;
  bound_device_id: string | null;
  target_schools: string[] | null;
  parent_email: string | null;
};

export type ExamResult = {
  id: string;
  user_id: string;
  total_questions: number;
  correct_answers: number;
  percentage: number;
  duration_seconds: number;
  subject_breakdown: SubjectBreakdownEntry[];
  breakdown_by_subject: SubjectBreakdownEntry[];
  completed_at: string;
  exam_type: string;
  time_spent_seconds: number | null;
  score: number | null;
};

export type SubjectBreakdownEntry = {
  subject: string;
  total: number;
  correct: number;
};

export type AvatarCatalogRow = {
  id: string;
  avatar_name: string;
  image_url: string;
  created_at: string;
};

export type AvatarRow = {
  id: string;
  url: string;
  created_at: string;
};

export type NewsRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export type SuggestionRow = {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
};

export type AdminAlertRow = {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  device_fingerprint: string;
  user_agent: string | null;
  message: string;
  created_at: string;
};

export type QuestionOverride = {
  id: string;
  question_key: string;
  subject: string;
  topic: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  updated_at: string;
};

export type ErrorBankEntry = {
  id: string;
  user_id: string;
  question_id: string;
  question_data: QuestionData;
  subject: string;
  topic: string;
  added_at: string;
};

export type QuestionData = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
  topic: string;
};

export type DailyStreak = {
  id: string;
  user_id: string;
  streak_count: number;
  last_study_date: string | null;
  updated_at: string;
};

export type RankingRow = {
  id: string;
  user_id: string;
  nickname: string;
  best_score: number;
  total_exams: number;
  updated_at: string;
};

export type MiniExamResult = {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  total_questions: number;
  correct_answers: number;
  percentage: number;
  completed_at: string;
};

export type DbQuestion = {
  id: string;
  subject: string;
  topic: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  question_type: string;
  is_paused: boolean;
  created_at: string;
};
