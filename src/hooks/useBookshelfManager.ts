
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/OutsetaAuthContext';

export const useBookshelfManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const addToBookshelf = useMutation({
    mutationFn: async (bookId: string) => {
      if (!user?.Uid) {
        throw new Error('User must be logged in to add books to bookshelf');
      }

      // First check if book is already in bookshelf
      const { data: existingBook, error: checkError } = await supabase
        .from('user_books')
        .select('*')
        .eq('book_id', bookId)
        .eq('outseta_user_id', user.Uid)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected
        throw checkError;
      }
      
      // If book is already in bookshelf, we're done
      if (existingBook) {
        return existingBook;
      }
      
      // If book is not in bookshelf, add it
      const { data, error } = await supabase
        .from('user_books')
        .insert({
          book_id: bookId,
          outseta_user_id: user.Uid,
          status: 'reading'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book added to your bookshelf"
      });
    },
    onError: (error) => {
      console.error('Error adding book to bookshelf:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add book to your bookshelf."
      });
    }
  });

  const checkBookInShelf = async (bookId: string): Promise<boolean> => {
    if (!user?.Uid) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select('*')
        .eq('book_id', bookId)
        .eq('outseta_user_id', user.Uid)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking bookshelf:', error);
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking bookshelf:', error);
      return false;
    }
  };

  return {
    addToBookshelf,
    checkBookInShelf
  };
};
