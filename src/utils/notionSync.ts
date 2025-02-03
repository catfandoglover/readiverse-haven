import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    
    toast({
      title: "Sync Completed",
      description: data?.message || "The Notion sync process has completed successfully.",
    });

    return data;
  } catch (error) {
    console.error('Error triggering Notion sync:', error);
    toast({
      variant: "destructive",
      title: "Sync Failed",
      description: error instanceof Error ? error.message : "Failed to trigger the Notion sync. Please try again later.",
    });
    throw error;
  }
}

// Make the function available globally for console access
(window as any).triggerNotionSync = triggerNotionSync;

// Also expose it as a named global for TypeScript support
declare global {
  interface Window {
    triggerNotionSync: typeof triggerNotionSync;
  }
}