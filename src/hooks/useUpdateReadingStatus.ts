
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateReadingStatus() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateReadingStatus = useCallback(async (bookId: string, status: string = 'reading') => {
    if (!user) {
      toast.error('You must be logged in to update reading status');
      return false;
    }

    try {
      setIsUpdating(true);
      
      // Check if the book is already in the user's library
      const { data: existingBook, error: fetchError } = await supabase
        .from('user_books')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking book status:', fetchError);
        toast.error('Failed to check book status');
        return false;
      }
      
      let result;
      
      if (existingBook) {
        // Update existing record
        result = await supabase
          .from('user_books')
          .update({ 
            status, 
            last_read_at: new Date().toISOString() 
          })
          .eq('id', existingBook.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_books')
          .insert({ 
            user_id: user.id,
            book_id: bookId,
            status,
            created_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
            outseta_user_id: '' // Required field with default value
          });
      }
      
      if (result.error) {
        console.error('Error updating reading status:', result.error);
        toast.error('Failed to update reading status');
        return false;
      }
      
      toast.success(`Book marked as "${status}"`);
      return true;
      
    } catch (error) {
      console.error('Exception updating reading status:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  return { updateReadingStatus, isUpdating };
}

export default useUpdateReadingStatus;
