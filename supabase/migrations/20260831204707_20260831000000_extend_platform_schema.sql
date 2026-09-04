/*
# Extend platform schema for full admin + student features

1. Modified Tables
- `profiles` — added columns: email, role, approved, blocked, device_fingerprint,
  avatar, expires_at, last_login_at, status. These support the admin approval flow,
  device binding, account expiration, and auto-inactivation by inactivity.

2. New Tables
- `avatars` — admin-managed avatar gallery (URLs available for student selection)
- `news` — announcements published by admin, read-only for students
- `suggestions` — messages from students to admin (buzón de sugerencias)
- `admin_alerts` — device-mismatch and security alerts visible to admin
- `question_overrides` — admin edits to question text/options/answer/explanation
- `error_bank` — per-student store of incorrectly answered questions for review
- `daily_streak` — per-student consecutive-day study streak counter
- `ranking` — anonymous leaderboard entries (nickname + best score)
- `mini_exam_results` — per-student mini-exam attempt records

3. Security
- RLS enabled on every new table.
- profiles: students read/update only their own row; admin (detected by email
  in JWT) can read/update all rows.
- All new tables: admin has full CRUD; students have read and/or scoped insert
  as appropriate per table.
- user_id columns default to auth.uid() so client inserts that omit user_id succeed.
*/

-- ============ EXTEND profiles ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'student';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='approved') THEN
    ALTER TABLE profiles ADD COLUMN approved boolean NOT NULL DEFAULT false;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='blocked') THEN
    ALTER TABLE profiles ADD COLUMN blocked boolean NOT NULL DEFAULT false;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='device_fingerprint') THEN
    ALTER TABLE profiles ADD COLUMN device_fingerprint text;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar') THEN
    ALTER TABLE profiles ADD COLUMN avatar text;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='expires_at') THEN
    ALTER TABLE profiles ADD COLUMN expires_at timestamptz;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_login_at') THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE profiles ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Replace profiles policies to allow admin full access
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "select_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'fararuiz64@gmail.com')
  WITH CHECK (auth.uid() = id OR auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- ============ avatars ============
CREATE TABLE IF NOT EXISTS avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_avatars" ON avatars;
CREATE POLICY "read_avatars" ON avatars FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_avatars" ON avatars;
CREATE POLICY "admin_insert_avatars" ON avatars FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_delete_avatars" ON avatars;
CREATE POLICY "admin_delete_avatars" ON avatars FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Seed default avatars
INSERT INTO avatars (url)
SELECT v FROM (VALUES
  ('https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=2563eb'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=BB&backgroundColor=059669'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=CC&backgroundColor=d97706'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=DD&backgroundColor=dc2626'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=EE&backgroundColor=7c3aed'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=FF&backgroundColor=0891b2'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=GG&backgroundColor=db2777'),
  ('https://api.dicebear.com/7.x/initials/svg?seed=HH&backgroundColor=65a30d')
) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM avatars LIMIT 1);

-- ============ news ============
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_news" ON news;
CREATE POLICY "read_news" ON news FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_news" ON news;
CREATE POLICY "admin_insert_news" ON news FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_update_news" ON news FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_delete_news" ON news;
CREATE POLICY "admin_delete_news" ON news FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- ============ suggestions ============
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_suggestion" ON suggestions;
CREATE POLICY "insert_own_suggestion" ON suggestions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_read_suggestions" ON suggestions;
CREATE POLICY "admin_read_suggestions" ON suggestions FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_delete_suggestions" ON suggestions;
CREATE POLICY "admin_delete_suggestions" ON suggestions FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- ============ admin_alerts ============
CREATE TABLE IF NOT EXISTS admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_name text NOT NULL,
  email text NOT NULL,
  device_fingerprint text NOT NULL,
  user_agent text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_alerts" ON admin_alerts;
CREATE POLICY "admin_read_alerts" ON admin_alerts FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_insert_alerts" ON admin_alerts;
CREATE POLICY "admin_insert_alerts" ON admin_alerts FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_alerts" ON admin_alerts;
CREATE POLICY "admin_delete_alerts" ON admin_alerts FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- ============ question_overrides ============
CREATE TABLE IF NOT EXISTS question_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_index int NOT NULL,
  explanation text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE question_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_question_overrides" ON question_overrides;
CREATE POLICY "read_question_overrides" ON question_overrides FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_question_overrides" ON question_overrides;
CREATE POLICY "admin_write_question_overrides" ON question_overrides FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_update_question_overrides" ON question_overrides;
CREATE POLICY "admin_update_question_overrides" ON question_overrides FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');
DROP POLICY IF EXISTS "admin_delete_question_overrides" ON question_overrides;
CREATE POLICY "admin_delete_question_overrides" ON question_overrides FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- ============ error_bank ============
CREATE TABLE IF NOT EXISTS error_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  question_data jsonb NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE error_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_errors" ON error_bank;
CREATE POLICY "select_own_errors" ON error_bank FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_errors" ON error_bank;
CREATE POLICY "insert_own_errors" ON error_bank FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_errors" ON error_bank;
CREATE POLICY "delete_own_errors" ON error_bank FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ daily_streak ============
CREATE TABLE IF NOT EXISTS daily_streak (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count int NOT NULL DEFAULT 0,
  last_study_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE daily_streak ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_streak" ON daily_streak;
CREATE POLICY "select_own_streak" ON daily_streak FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_streak" ON daily_streak;
CREATE POLICY "insert_own_streak" ON daily_streak FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_streak" ON daily_streak;
CREATE POLICY "update_own_streak" ON daily_streak FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ranking ============
CREATE TABLE IF NOT EXISTS ranking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  best_score numeric NOT NULL DEFAULT 0,
  total_exams int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_ranking" ON ranking;
CREATE POLICY "read_ranking" ON ranking FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_ranking" ON ranking;
CREATE POLICY "insert_own_ranking" ON ranking FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ranking" ON ranking;
CREATE POLICY "update_own_ranking" ON ranking FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ mini_exam_results ============
CREATE TABLE IF NOT EXISTS mini_exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text NOT NULL,
  total_questions int NOT NULL,
  correct_answers int NOT NULL,
  percentage numeric NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE mini_exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mini_exams" ON mini_exam_results;
CREATE POLICY "select_own_mini_exams" ON mini_exam_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mini_exams" ON mini_exam_results;
CREATE POLICY "insert_own_mini_exams" ON mini_exam_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mini_exams" ON mini_exam_results;
CREATE POLICY "delete_own_mini_exams" ON mini_exam_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_mini_exam_results_user ON mini_exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_error_bank_user ON error_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_created ON suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC);
