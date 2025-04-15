import { supabase } from '@/integrations/supabase/client';

// This is a temporary workaround for the type issue with Supabase client
// TypeScript doesn't properly recognize the 'from' method on SupabaseClient
// This function casts the client to any type to bypass the type check
export const getSupabaseClient = () => {
  return supabase as any;
};

// Shorthand for the above
export const supabaseAny = supabase as any; 