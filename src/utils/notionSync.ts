import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function triggerNotionSync() {
  try {
    const { error } = await supabase.functions.invoke('sync-notion-questions', {
      method: 'POST',
    });

    if (error) throw error;
    
    toast({
      title: "Sync Started",
      description: "The Notion sync process has been triggered successfully.",
    });
  } catch (error) {
    console.error('Error triggering Notion sync:', error);
    toast({
      title: "Sync Failed",
      description: "Failed to trigger the Notion sync. Please try again later.",
      variant: "destructive",
    });
  }
}