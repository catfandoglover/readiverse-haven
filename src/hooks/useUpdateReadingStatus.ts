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
        // First check if the book exists in user_books
        const { data: existingBook } = await supabase
          .from('user_books')
          .select('*')
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .single();

        if (existingBook) {
          // Update existing record
          const { error } = await supabase
            .from('user_books')
            .update({
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('book_id', bookId);

          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('user_books')
            .insert({
              user_id: userId,
              book_id: bookId,
              created_at: new Date().toISOString()
            });

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error updating reading status:', error);
      }
    }

    updateStatus();
  }, [userId, bookId, currentLocation]);
};
