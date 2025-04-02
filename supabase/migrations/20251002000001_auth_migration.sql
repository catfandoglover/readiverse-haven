-- Update profiles table to work with Supabase Auth
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Make outseta_user_id nullable since we're transitioning to Supabase Auth
ALTER TABLE IF EXISTS profiles
ALTER COLUMN outseta_user_id DROP NOT NULL;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to use user_id instead of outseta_user_id
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update other tables to use user_id
ALTER TABLE IF EXISTS user_books
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE IF EXISTS user_favorites
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for user_books
DROP POLICY IF EXISTS "Users can manage their own books" ON user_books;
CREATE POLICY "Users can manage their own books" ON user_books
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update RLS policies for user_favorites
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (user_id = auth.uid()); 
