
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
