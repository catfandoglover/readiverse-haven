-- Make outseta_user_id nullable since we're transitioning to Supabase Auth
ALTER TABLE public.profiles
ALTER COLUMN outseta_user_id DROP NOT NULL;

-- Add user_id column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add vanity_url column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vanity_url TEXT;

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  formatted_name TEXT;
  user_id_prefix TEXT;
  vanity_url TEXT;
  full_name TEXT;
BEGIN
  -- Get the full name from user metadata
  full_name := new.raw_user_meta_data->>'full_name';
  
  -- If no full name is provided, use a default
  IF full_name IS NULL OR full_name = '' THEN
    full_name := 'User';
  END IF;
  
  -- Create vanity URL: formatted-name-userIdPrefix
  formatted_name := regexp_replace(full_name, '\s+', '-', 'g');
  user_id_prefix := substring(new.id::text, 1, 4);
  vanity_url := formatted_name || '-' || user_id_prefix;

  -- Insert the new profile with vanity_url
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at, vanity_url)
  VALUES (
    new.id,
    new.email,
    full_name,
    now(),
    now(),
    vanity_url
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid() OR outseta_user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid() OR outseta_user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid() OR outseta_user_id = auth.uid()::text);

-- Add policy to allow public read of profiles by vanity_url for sharing
DROP POLICY IF EXISTS "Anyone can read profiles by vanity_url" ON profiles;
CREATE POLICY "Anyone can read profiles by vanity_url"
  ON profiles FOR SELECT
  USING (vanity_url IS NOT NULL);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 
