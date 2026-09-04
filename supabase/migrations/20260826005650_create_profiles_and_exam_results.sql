/*
# Create profiles and exam_results tables for ECOEMS platform

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — one row per user
  - `full_name` (text, not null) — student's display name
  - `created_at` (timestamptz, default now())
- `exam_results`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users) — owner
  - `total_questions` (int, not null) — total questions in the exam (128)
  - `correct_answers` (int, not null) — number correct
  - `percentage` (numeric, not null) — effectiveness percentage
  - `duration_seconds` (int, not null) — time taken
  - `subject_breakdown` (jsonb, not null) — per-subject score detail
  - `completed_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- profiles: each authenticated user can read/update only their own row.
- exam_results: each authenticated user can read and insert only their own rows.
- user_id defaults to auth.uid() so inserts that omit it succeed.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  total_questions int NOT NULL,
  correct_answers int NOT NULL,
  percentage numeric NOT NULL,
  duration_seconds int NOT NULL,
  subject_breakdown jsonb NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_results" ON exam_results;
CREATE POLICY "select_own_results" ON exam_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_results" ON exam_results;
CREATE POLICY "insert_own_results" ON exam_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_results" ON exam_results;
CREATE POLICY "delete_own_results" ON exam_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
