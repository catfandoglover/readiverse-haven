-- First, check the user_books table structure to see if outseta_user_id is required
ALTER TABLE IF EXISTS public.user_books
ALTER COLUMN outseta_user_id DROP NOT NULL;

-- Add Divine Comedy to all existing users who don't already have it
INSERT INTO public.user_books (user_id, outseta_user_id, book_id, status, current_page, last_read_at, created_at, updated_at)
SELECT 
  p.user_id, 
  p.outseta_user_id,
  'f6f6ec79-9eaf-43c7-8072-bec3a1cd9b02'::uuid, 
  'reading', 
  0, 
  now(),
  now(),
  now()
FROM 
  public.profiles p
WHERE 
  p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_books 
    WHERE user_books.user_id = p.user_id 
      AND book_id = 'f6f6ec79-9eaf-43c7-8072-bec3a1cd9b02'::uuid
  );

-- Update the handle_new_user function to add Divine Comedy for new users
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
  
  -- Add Divine Comedy to this user's bookshelf
  INSERT INTO public.user_books (user_id, outseta_user_id, book_id, status, current_page, last_read_at, created_at, updated_at)
  VALUES (
    new.id,
    NULL,
    'f6f6ec79-9eaf-43c7-8072-bec3a1cd9b02'::uuid,
    'reading',
    0,
    now(),
    now(),
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 