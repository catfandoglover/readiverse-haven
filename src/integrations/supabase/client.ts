
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://myeyoafugkrkwcnfedlu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZXlvYWZ1Z2tya3djbmZlZGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTkxMzUsImV4cCI6MjA1MTk3NTEzNX0.9Jk5x5wDao4IbddZKPAUvoh_ZcZqtBSKZgiYlZRMCRQ";

export const createSupabaseClient = (jwt?: string) => {
  return createClient<Database>(
    SUPABASE_URL,
    jwt || SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: jwt ? {
          Authorization: `Bearer ${jwt}`
        } : undefined
      }
    }
  );
};

// Export the default client instance
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
