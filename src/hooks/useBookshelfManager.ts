
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBookshelfManager() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const addBookToLibrary = useCallback(async (bookId: string) => {
    if (!user) {
      toast.error('You must be logged in to add books to your library');
      return false;
    }

    try {
      setIsProcessing(true);
      
      // Check if the book is already in the user's library
      const { data: existingBook, error: fetchError } = await supabase
        .from('user_books')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking book status:', fetchError);
        toast.error('Failed to check if book is already in your library');
        return false;
      }
      
      if (existingBook) {
        toast.info('This book is already in your library');
        return true;
      }
      
      // Add the book to the user's library
      const { error: insertError } = await supabase
        .from('user_books')
        .insert({ 
          user_id: user.id, 
          book_id: bookId, 
          status: 'reading',
          outseta_user_id: '' // Required field with default value
        });
      
      if (insertError) {
        console.error('Error adding book to library:', insertError);
        toast.error('Failed to add book to your library');
        return false;
      }
      
      toast.success('Book added to your library');
      return true;
      
    } catch (error) {
      console.error('Exception adding book to library:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const removeBookFromLibrary = useCallback(async (bookId: string) => {
    if (!user) {
      toast.error('You must be logged in to remove books from your library');
      return false;
    }

    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('user_books')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);
      
      if (error) {
        console.error('Error removing book from library:', error);
        toast.error('Failed to remove book from your library');
        return false;
      }
      
      toast.success('Book removed from your library');
      return true;
      
    } catch (error) {
      console.error('Exception removing book from library:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  return { addBookToLibrary, removeBookFromLibrary, isProcessing };
}

export default useBookshelfManager;
