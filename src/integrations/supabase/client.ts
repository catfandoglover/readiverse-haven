
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://myeyoafugkrkwcnfedlu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZXlvYWZ1Z2tya3djbmZlZGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTkxMzUsImV4cCI6MjA1MTk3NTEzNX0.9Jk5x5wDao4IbddZKPAUvoh_ZcZqtBSKZgiYlZRMCRQ';

// Create the default client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false
    }
  }
);

// Factory function for creating clients with custom tokens
export const createSupabaseClient = (customToken?: string) => {
  return createClient<Database>(
    supabaseUrl,
    customToken || supabaseAnonKey,
    {
      auth: {
        persistSession: false
      }
    }
  );
};
