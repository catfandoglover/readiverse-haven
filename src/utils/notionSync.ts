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
      title: "Test Successful",
      description: "Edge Function connection test completed.",
    });

    return data;
  } catch (error) {
    console.error('Error triggering Edge Function:', error);
    toast({
      variant: "destructive",
      title: "Connection Test Failed",
      description: "Failed to connect to Edge Function. Check console for details.",
    });
    throw error;
  }
}

// Make the function available globally for console access
(window as any).triggerNotionSync = triggerNotionSync;