
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function triggerNotionSync() {
  try {
    console.log('Starting Notion sync process...');
    const { data, error } = await supabase.functions.invoke('sync-notion-questions', {
      method: 'POST',
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      toast.error('Failed to sync with Notion');
      throw error;
    }
    
    console.log('Sync response:', data);
    toast.success('Successfully synced with Notion');
    return data;
  } catch (error) {
    console.error('Error triggering Edge Function:', error);
    toast.error('Failed to sync with Notion');
    return null;
  }
}

// Make the function available globally
globalThis.triggerNotionSync = triggerNotionSync;

// Also expose it on window for browser environments
if (typeof window !== 'undefined') {
  (window as any).triggerNotionSync = triggerNotionSync;
}
