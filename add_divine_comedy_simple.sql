-- First, make sure the outseta_user_id column is nullable
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