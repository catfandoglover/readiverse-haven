-- First make sure outseta_user_id is nullable (if it's not already)
ALTER TABLE IF EXISTS public.user_favorites
ALTER COLUMN outseta_user_id DROP NOT NULL;

-- Add Virgil to favorites for all existing users who don't already have him
INSERT INTO public.user_favorites (user_id, outseta_user_id, item_id, item_type, added_at)
SELECT 
  p.user_id, 
  p.outseta_user_id,
  '50ec0b98-3993-45d3-a125-ba8050185723'::uuid, 
  'icon', 
  now()
FROM 
  public.profiles p
WHERE 
  p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_favorites 
    WHERE user_favorites.user_id = p.user_id 
      AND item_id = '50ec0b98-3993-45d3-a125-ba8050185723'::uuid 
      AND item_type = 'icon'
  );

-- Drop the existing handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create or replace the function to add Virgil to favorites for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  formatted_name TEXT;
  user_id_prefix TEXT;
  vanity_url TEXT;
  full_name TEXT;
  profile_id UUID;
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
  )
  RETURNING id INTO profile_id;
  
  -- Add Virgil to favorites for this new user
  INSERT INTO public.user_favorites (user_id, outseta_user_id, item_id, item_type, added_at)
  VALUES (
    new.id,
    NULL,
    '50ec0b98-3993-45d3-a125-ba8050185723'::uuid,
    'icon',
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 