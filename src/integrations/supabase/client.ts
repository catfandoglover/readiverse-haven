// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://myeyoafugkrkwcnfedlu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZXlvYWZ1Z2tya3djbmZlZGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTEzMTAsImV4cCI6MjA1ODY4NzMxMH0.aYCbR62ym2XYDdY6Ss6sGj14yOy3i8wj9f5gHujmqDI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// This is a properly typed version of the client that includes the 'from' method
// Use this when you need to access methods like 'from', 'auth', etc.
export const supabaseClient = supabase as any;