import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  description: string;
  created_at: string;
  updated_at: string | null;
}

interface UserBook {
  id: string;
  book_id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  books: Book;
}

export function useBookshelfManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_books')
          .select('*, books(*)')
          .eq('user_id', user.id);

        if (error) throw error;

        // Type assertion to handle the books data
        const userBooks = data as unknown as UserBook[];
        setBooks(userBooks.map(item => item.books));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch books'));
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [user?.id]);

  const addToBookshelf = useMutation({
    mutationFn: async (bookId: string) => {
      if (!user?.id) {
        throw new Error('User must be logged in to add books to bookshelf');
      }

      const { data: existingBook } = await supabase
        .from('user_books')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .single();
      
      if (existingBook) {
        throw new Error('Book already in bookshelf');
      }

      const { error } = await supabase
        .from('user_books')
        .insert({
          book_id: bookId,
          user_id: user.id,
          status: 'reading'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Book added to your bookshelf',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const checkBookInShelf = async (bookId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data } = await supabase
        .from('user_books')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .single();
        
      return !!data;
    } catch (error) {
      return false;
    }
  };

  return {
    books,
    loading,
    error,
    addToBookshelf: addToBookshelf.mutate,
    checkBookInShelf
  };
}
