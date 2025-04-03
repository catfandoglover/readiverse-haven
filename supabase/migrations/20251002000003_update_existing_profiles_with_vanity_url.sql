-- Function to generate a vanity URL from a profile's full name and user ID
CREATE OR REPLACE FUNCTION public.generate_vanity_url(full_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  formatted_name TEXT;
  user_id_prefix TEXT;
BEGIN
  -- Default name if none provided
  IF full_name IS NULL OR full_name = '' THEN
    full_name := 'User';
  END IF;
  
  -- Create vanity URL: formatted-name-userIdPrefix
  formatted_name := regexp_replace(full_name, '\s+', '-', 'g');
  user_id_prefix := substring(user_id::text, 1, 4);
  RETURN formatted_name || '-' || user_id_prefix;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles that don't have a vanity_url yet
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN
    SELECT * FROM profiles 
    WHERE vanity_url IS NULL AND user_id IS NOT NULL
  LOOP
    UPDATE profiles
    SET vanity_url = public.generate_vanity_url(profile_record.full_name, profile_record.user_id)
    WHERE id = profile_record.id;
  END LOOP;
END $$; 