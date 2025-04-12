import { supabase } from '@/integrations/supabase/client'; // Corrected import path
import { Prompt } from '@/types/prompt'; // Assuming a Prompt type exists

interface FetchPromptArgs {
  id?: string;
  purpose?: string;
  context?: string;
}

/**
 * Fetches a single prompt from the prompts table based on ID, purpose, or context.
 * TODO: Implement proper error handling and potentially caching.
 * @param args - Object containing id, purpose, or context to filter by.
 * @returns The prompt object or null if not found.
 */
export const fetchPromptByPurposeOrId = async (
  args: FetchPromptArgs
): Promise<Prompt | null> => {
  let query = supabase.from('prompts').select('*').limit(1);

  if (args.id) {
    query = query.eq('id', args.id);
  } else if (args.purpose) {
    query = query.eq('purpose', args.purpose);
    if (args.context) {
      // Add context filter if both purpose and context are provided
      query = query.eq('context', args.context);
    }
  } else if (args.context) {
    // Allow fetching by context alone if needed, though purpose is more specific
    query = query.eq('context', args.context);
  }
  
  // Add order by if needed, e.g., to prioritize specific prompts if multiple match
  // query = query.order('created_at', { ascending: false }); 

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }

  return data as Prompt | null;
};

// Placeholder for Prompt type if it doesn't exist
// You should define this properly based on your prompts table schema
// export interface Prompt {
//   id: string | number;
//   context: string | null;
//   purpose: string | null;
//   prompt: string;
//   section: string | null;
//   display_order: number | null;
//   user_title: string | null;
//   user_subtitle: string | null;
//   icon_display: string | null;
//   grading_rubric: string | null;
//   created_at: string;
//   updated_at: string;
// } 
