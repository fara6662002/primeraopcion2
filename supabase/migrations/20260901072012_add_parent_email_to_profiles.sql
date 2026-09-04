-- Add parent_email column to profiles for tutor/parent contact
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='parent_email') THEN
    ALTER TABLE profiles ADD COLUMN parent_email text;
  END IF;
END $$;
