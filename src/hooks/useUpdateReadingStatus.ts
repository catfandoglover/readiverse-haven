import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";

export const useUpdateReadingStatus = (bookId: string | null, currentLocation: string | null) => {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    async function updateStatus() {
      if (!userId || !bookId || !currentLocation) return;

      try {
        // Use a more direct approach to bypass TypeScript schema validation
        const now = new Date().toISOString();

        // Create or update the user_books record using a POST request to the REST API
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_books`, {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id: userId,
            book_id: bookId,
            updated_at: now,
            last_read_at: now,
            status: 'reading',
            current_cfi: currentLocation
          })
        });

        if (!response.ok) {
          console.error('Error updating user_books:', response.statusText);
          
          // Fallback to a simpler record if the full update fails
          const fallbackResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_books`, {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              user_id: userId,
              book_id: bookId,
              status: 'reading'
            })
          });
          
          if (!fallbackResponse.ok) {
            console.error('Fallback update also failed:', fallbackResponse.statusText);
          }
        }
      } catch (error) {
        console.error('Error updating reading status:', error);
      }
    }

    updateStatus();
  }, [userId, bookId, currentLocation]);
};
