# Profile Vanity URL Migration Plan

This migration adds vanity URLs to user profiles, which are used for shareable profile links. The vanity URL format is: `{full-name-with-hyphens}-{first-4-chars-of-user-id}`.

## Migrations Included

1. **Update Profile Creation Trigger** (`supabase/migrations/20251002000002_fix_profiles.sql`)
   - Added vanity_url column to profiles table
   - Modified handle_new_user function to generate and store vanity URLs for new users
   - Added public access policy to allow reading profiles by vanity_url

2. **Generate Vanity URLs for Existing Profiles** (`supabase/migrations/20251002000003_update_existing_profiles_with_vanity_url.sql`)
   - Created a function to generate vanity URLs
   - Added a one-time script to update all existing profiles that don't have a vanity URL

## Implementation Steps

1. Make sure the `signUpFields` in the Auth UI component includes the full_name field:
   - Updated in `src/pages/Login.tsx` to capture full name during registration

2. Updated profile sharing logic in:
   - `src/components/profile/ProfileHeader.tsx` to use vanity URLs for sharing
   - `src/pages/ShareableProfile.tsx` to look up profiles by vanity URL

## How to Apply the Migrations

1. These migrations can be applied through the Supabase dashboard or using the Supabase CLI:

```bash
# Using Supabase CLI
supabase db push

# Or manually by running the SQL files in the Supabase SQL editor
```

## Testing

1. Test creating a new user to verify the vanity URL is generated correctly
2. Test sharing a profile to verify the vanity URL works in the shared link
3. Verify existing profiles have been updated with vanity URLs

## Rollback Plan

If issues occur, the following SQL can be used to rollback the changes:

```sql
-- Remove the vanity URL column
ALTER TABLE profiles DROP COLUMN IF EXISTS vanity_url;

-- Restore the original handle_new_user function
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

-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can read profiles by vanity_url" ON profiles;
``` 