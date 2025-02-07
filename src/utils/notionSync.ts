
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
    // Don't throw the error, just log it
    return null;
  }
}

// Immediately make the function available globally when this module loads
globalThis.triggerNotionSync = triggerNotionSync;

// Also expose it on window for browser environments
if (typeof window !== 'undefined') {
  (window as any).triggerNotionSync = triggerNotionSync;
}

