
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OutsetaAuthContext';

export const useLastReadBook = () => {
  const { user } = useAuth();
  const userId = user?.Uid;

  return useQuery({
    queryKey: ['lastReadBook', userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      // First try to get the last read book
      const { data: lastReadBook, error: lastReadError } = await supabase
        .from('user_books')
        .select(`
          *,
          book:book_id(
            id,
            title,
            author,
            cover_url,
            epub_file_url,
            slug,
            Cover_super
          )
        `)
        .eq('outseta_user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastReadError) {
        console.error('Error fetching last read book:', lastReadError);
      }

      // If there's a last read book, return it
      if (lastReadBook?.book) {
        return {
          ...lastReadBook,
          book: lastReadBook.book
        };
      }

      // If no last read book, try to get most recently added book
      const { data: lastAddedBook, error: lastAddedError } = await supabase
        .from('user_books')
        .select(`
          *,
          book:book_id(
            id,
            title,
            author,
            cover_url,
            epub_file_url,
            slug,
            Cover_super
          )
        `)
        .eq('outseta_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastAddedError) {
        console.error('Error fetching last added book:', lastAddedError);
      }

      if (lastAddedBook?.book) {
        return {
          ...lastAddedBook,
          book: lastAddedBook.book
        };
      }

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

      return {
        book: defaultBook,
        isDefaultBook: true
      };
    },
    enabled: !!userId,
  });
};
