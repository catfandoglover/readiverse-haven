import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"

export const NotionSync = () => {
  const { toast } = useToast()

  const handleSync = async () => {
    try {
      const response = await fetch(
        'https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/sync-notion-questions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to sync with Notion')
      }

      toast({
        title: "Success",
        description: "Successfully synced questions from Notion",
      })
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: "Error",
        description: "Failed to sync with Notion",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleSync}>
      Sync Questions from Notion
    </Button>
  )
}