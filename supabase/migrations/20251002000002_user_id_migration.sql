-- Update user_books table to use user_id
ALTER TABLE IF EXISTS user_books
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update user_favorites table to use user_id
ALTER TABLE IF EXISTS user_favorites
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update profiles table to use user_id
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create a function to migrate data from outseta_user_id to user_id
CREATE OR REPLACE FUNCTION public.migrate_user_ids()
RETURNS void AS $$
BEGIN
  -- Update user_books
  UPDATE user_books ub
  SET user_id = p.user_id
  FROM profiles p
  WHERE ub.outseta_user_id = p.outseta_user_id;

  -- Update user_favorites
  UPDATE user_favorites uf
  SET user_id = p.user_id
  FROM profiles p
  WHERE uf.outseta_user_id = p.outseta_user_id;

  -- Update profiles
  UPDATE profiles p
  SET user_id = auth.uid()
  WHERE p.outseta_user_id = auth.jwt()->>'sub';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the migration
SELECT public.migrate_user_ids();

-- Drop the migration function
DROP FUNCTION public.migrate_user_ids();

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Users can manage their own books" ON user_books;
CREATE POLICY "Users can manage their own books" ON user_books
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
CREATE POLICY "Users can delete their own favorites" ON user_favorites
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Make outseta_user_id columns nullable since we're transitioning to user_id
ALTER TABLE IF EXISTS user_books
ALTER COLUMN outseta_user_id DROP NOT NULL;

ALTER TABLE IF EXISTS user_favorites
ALTER COLUMN outseta_user_id DROP NOT NULL;

ALTER TABLE IF EXISTS profiles
ALTER COLUMN outseta_user_id DROP NOT NULL; 
