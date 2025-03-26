
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OutsetaAuthContext';

export const useLastReadBook = () => {
  const { user } = useAuth();
  const userId = user?.Account?.Uid; // Use Account.Uid for consistency with AllBooksContent

  console.log('useLastReadBook - user:', user);
  console.log('useLastReadBook - userId:', userId);

  return useQuery({
    queryKey: ['lastReadBook', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('useLastReadBook - No userId found, returning null');
        return null;
      }

      console.log('useLastReadBook - Fetching last read book for userId:', userId);

      // First try to get the last read book
      const { data: lastReadBook, error: lastReadError } = await supabase
        .from('user_books')
        .select(`
          *,
          book:books!book_id(*)
        `)
        .eq('outseta_user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastReadError) {
        console.error('Error fetching last read book:', lastReadError);
      }

      console.log('useLastReadBook - Last read book data:', lastReadBook);

      // If there's a last read book, return it
      if (lastReadBook?.book) {
        return {
          ...lastReadBook,
          book: lastReadBook.book
        };
      }

      console.log('useLastReadBook - No last read book found, trying last added book');

      // If no last read book, try to get most recently added book
      const { data: lastAddedBook, error: lastAddedError } = await supabase
        .from('user_books')
        .select(`
          *,
          book:books!book_id(*)
        `)
        .eq('outseta_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastAddedError) {
        console.error('Error fetching last added book:', lastAddedError);
      }

      console.log('useLastReadBook - Last added book data:', lastAddedBook);

      if (lastAddedBook?.book) {
        return {
          ...lastAddedBook,
          book: lastAddedBook.book
        };
      }

      console.log('useLastReadBook - No books found, fetching default book');

      // If no books found at all, fetch the default book
      const { data: defaultBook, error: defaultBookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', '4e06e362-b1ba-4825-a153-d7f0170dd9d6')
        .single();

      if (defaultBookError) {
        console.error('Error fetching default book:', defaultBookError);
        return null;
      }

      console.log('useLastReadBook - Default book:', defaultBook);

      return {
        book: defaultBook,
        isDefaultBook: true
      };
    },
    enabled: !!userId,
  });
};
