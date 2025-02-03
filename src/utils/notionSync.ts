import { supabase } from "@/integrations/supabase/client";

export async function triggerNotionSync() {
  try {
    console.log('Starting Notion sync process...');
    const { data, error } = await supabase.functions.invoke('sync-notion-questions', {
      method: 'POST',
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw error;
    }
    
    console.log('Sync response:', data);
    return data;
  } catch (error) {
    console.error('Error triggering Edge Function:', error);
    throw error;
  }
}

// Make the function available globally for console access
(window as any).triggerNotionSync = triggerNotionSync;