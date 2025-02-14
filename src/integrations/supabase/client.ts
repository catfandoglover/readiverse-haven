
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://myeyoafugkrkwcnfedlu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZXlvYWZ1Z2tya3djbmZlZGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTkxMzUsImV4cCI6MjA1MTk3NTEzNX0.9Jk5x5wDao4IbddZKPAUvoh_ZcZqtBSKZgiYlZRMCRQ";

// Create Supabase client with custom auth token
export const createSupabaseClient = (customToken?: string) => {
  const apiKey = customToken || SUPABASE_PUBLISHABLE_KEY;
  console.log('Creating Supabase client with token:', !!customToken);
  
  return createClient<Database>(
    SUPABASE_URL,
    apiKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: customToken ? {
          'Authorization': `Bearer ${customToken}`
        } : {
          'apikey': SUPABASE_PUBLISHABLE_KEY
        }
      }
    }
  );
};

// Default client instance
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
