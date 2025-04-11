import { useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

export const useUpdateReadingStatus = (bookId: string | null, currentLocation: string | null) => {
  const { user, supabase: authenticatedSupabase } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    async function updateStatus() {
      if (!userId || !bookId || !currentLocation || !authenticatedSupabase) return;

      try {
        const now = new Date().toISOString();

        // First check if the record exists
        // @ts-ignore - Supabase client type issues
        const { data: existingRecord } = await authenticatedSupabase
          .from('user_books')
          .select('id')
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .single();

        if (existingRecord) {
          // Update existing record
          // @ts-ignore - Supabase client type issues
          const { error } = await authenticatedSupabase
            .from('user_books')
            .update({
              updated_at: now,
              last_read_at: now,
              status: 'reading',
              current_cfi: currentLocation
            })
            .eq('user_id', userId)
            .eq('book_id', bookId);

          if (error) {
            console.error('Error updating user_books:', error);
          }
        } else {
          // Insert new record
          // @ts-ignore - Supabase client type issues
          const { error } = await authenticatedSupabase
            .from('user_books')
            .insert({
              user_id: userId,
              book_id: bookId,
              updated_at: now,
              last_read_at: now,
              status: 'reading',
              current_cfi: currentLocation,
              created_at: now
            });

          if (error) {
            console.error('Error inserting user_books:', error);
            
            // Fallback to a simpler record if the full insert fails
            // @ts-ignore - Supabase client type issues
            const { error: fallbackError } = await authenticatedSupabase
              .from('user_books')
              .insert({
                user_id: userId,
                book_id: bookId,
                status: 'reading',
                created_at: now
              });
            
            if (fallbackError) {
              console.error('Fallback insert also failed:', fallbackError);
            }
          }
        }
      } catch (error) {
        console.error('Error updating reading status:', error);
      }
    }

    updateStatus();
  }, [userId, bookId, currentLocation, authenticatedSupabase]);
};
