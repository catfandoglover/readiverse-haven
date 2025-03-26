
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to update the reading status of a book in the user's library
 * Updates the last_read_at timestamp and current_cfi position
 */
export const useUpdateReadingStatus = (
  bookId: string | null | undefined,
  currentLocation: string | null
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.Uid;

  useEffect(() => {
    // Only update if we have all necessary data
    if (!userId || !bookId || !currentLocation) return;

    const updateReadingStatus = async () => {
      try {
        // Check if book exists in user's library
        const { data: existingBook } = await supabase
          .from('user_books')
          .select('id')
          .eq('outseta_user_id', userId)
          .eq('book_id', bookId)
          .maybeSingle();

        if (existingBook) {
          // Update existing record
          await supabase
            .from('user_books')
            .update({
              last_read_at: new Date().toISOString(),
              current_cfi: currentLocation,
              status: 'reading'
            })
            .eq('outseta_user_id', userId)
            .eq('book_id', bookId);
        } else {
          // Insert new record
          await supabase
            .from('user_books')
            .insert({
              outseta_user_id: userId,
              book_id: bookId,
              current_cfi: currentLocation,
              last_read_at: new Date().toISOString(),
              status: 'reading'
            });
        }
      } catch (error) {
        console.error('Error updating reading status:', error);
      }
    };

    // Set a timeout to avoid too many rapid updates
    const timeoutId = setTimeout(() => {
      updateReadingStatus();
    }, 5000); // Update every 5 seconds when location changes

    return () => clearTimeout(timeoutId);
  }, [userId, bookId, currentLocation]);
};
