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