import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfileData } from '@/contexts/ProfileDataContext';

// Type assertion to silence TypeScript errors for complex queries
const supabaseAny = supabase as any;

export const useLastReadBook = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { dnaAnalysisData } = useProfileData();
  const assessmentId = dnaAnalysisData?.assessment_id;

  console.log('useLastReadBook - user:', user);
  console.log('useLastReadBook - userId:', userId);
  console.log('useLastReadBook - assessmentId:', assessmentId);

  return useQuery({
    queryKey: ['lastReadBook', userId, assessmentId],
    queryFn: async () => {
      if (!userId) {
        console.log('useLastReadBook - No userId found, returning null');
        return null;
      }

      console.log('useLastReadBook - Fetching last read book for userId:', userId);

      // First try to get the last read book with status 'reading'
      const { data: lastReadingBook, error: lastReadingError } = await supabaseAny
        .from('user_books')
        .select(`
          *,
          book:books!user_books_book_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'reading') // Only consider books with 'reading' status
        .order('last_read_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastReadingError) {
        console.error('Error fetching last reading book:', lastReadingError);
      }

      console.log('useLastReadBook - Last reading book data:', lastReadingBook);

      // If there's a last read book with status 'reading', return it
      if (lastReadingBook?.book) {
        return {
          ...lastReadingBook,
          book: lastReadingBook.book,
          source: 'user_books'
        };
      }

      console.log('useLastReadBook - No books with status reading found, checking any book by last_read_at');

      // If no book with 'reading' status found, try to get any last read book regardless of status
      const { data: lastReadBook, error: lastReadError } = await supabaseAny
        .from('user_books')
        .select(`
          *,
          book:books!user_books_book_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastReadError) {
        console.error('Error fetching any last read book:', lastReadError);
      }

      console.log('useLastReadBook - Any last read book data:', lastReadBook);

      // If there's any last read book, return it
      if (lastReadBook?.book) {
        return {
          ...lastReadBook,
          book: lastReadBook.book,
          source: 'user_books'
        };
      }

      console.log('useLastReadBook - No book with last_read_at found, checking last added book');

      // If no last read book found, try to get most recently added book
      const { data: lastAddedBook, error: lastAddedError } = await supabaseAny
        .from('user_books')
        .select(`
          *,
          book:books!user_books_book_id_fkey(*)
        `)
        .eq('user_id', userId)
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
          book: lastAddedBook.book,
          source: 'user_books'
        };
      }

      // If user has an assessment ID, try to get a book from their DNA matches
      if (assessmentId) {
        console.log('useLastReadBook - Checking DNA books for assessmentId:', assessmentId);
        
        try {
          // First get a matched book ID from dna_analysis_results_matched
          const { data: dnaMatches, error: dnaMatchError } = await supabaseAny
            .from("dna_analysis_results_matched")
            .select("matched_id, dna_analysis_column")
            .eq("assessment_id", assessmentId)
            .like("dna_analysis_column", `%_classic`)
            .limit(1);
            
          if (dnaMatchError) {
            console.error('Error fetching DNA matched books:', dnaMatchError);
          } else if (dnaMatches && dnaMatches.length > 0) {
            console.log('useLastReadBook - Found DNA match:', dnaMatches[0]);
            
            // Get the book data for this match
            const { data: dnaBook, error: dnaBookError } = await supabaseAny
              .from("books")
              .select("*")
              .eq("id", dnaMatches[0].matched_id)
              .single();
              
            if (dnaBookError) {
              console.error('Error fetching DNA book:', dnaBookError);
            } else if (dnaBook) {
              console.log('useLastReadBook - Found DNA book:', dnaBook);
              
              // Add this book to user_books to ensure it shows up in ALL BOOKS with status 'reading'
              const { error: addBookError } = await supabaseAny
                .from('user_books')
                .upsert({
                  user_id: userId,
                  book_id: dnaBook.id,
                  status: 'reading',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id,book_id'
                });
                
              if (addBookError) {
                console.error('Error adding DNA book to user_books:', addBookError);
              } else {
                console.log('useLastReadBook - Added DNA book to user_books');
              }
              
              return {
                book: dnaBook,
                source: 'dna_analysis',
                isDnaBook: true
              };
            }
          }
        } catch (err) {
          console.error('Error processing DNA books:', err);
        }
      }

      console.log('useLastReadBook - No books found, fetching default book');

      // If no books found at all, fetch the default book
      const { data: defaultBook, error: defaultBookError } = await supabaseAny
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
        isDefaultBook: true,
        source: 'default'
      };
    },
    enabled: !!userId,
  });
};
