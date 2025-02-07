
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NotionSyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      toast.info('Starting Notion sync...');
      
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
    } catch (error) {
      console.error('Error triggering Edge Function:', error);
      toast.error('Failed to sync with Notion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Sync Questions
    </Button>
  );
}
