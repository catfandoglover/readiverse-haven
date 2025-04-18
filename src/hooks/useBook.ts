
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Extend the Book type to include author_id
type Book = Database['public']['Tables']['books']['Row'] & { 
  author_id?: string; // Add author_id as an optional property
};

export const useBook = (slug: string | undefined) => {
  return useQuery<Book | null>({
    queryKey: ['book', slug],
    queryFn: async () => {
      if (!slug) return null;

      console.log('Fetching book with slug:', slug);
      
      try {
        // First try with exact case
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.log('Initial query error:', error);
          
          // Next, try with the ID
          const { data: idData, error: idError } = await supabase
            .from('books')
            .select('*')
            .eq('id', slug)
            .single();
            
          if (!idError && idData) {
            console.log('Book found by ID:', {
              found: !!idData,
              hasEpubUrl: idData?.epub_file_url ? 'yes' : 'no',
              hasAuthor: idData?.author ? 'yes' : 'no',
              hasAuthorId: idData?.author_id ? 'yes' : 'no',
              hasCoverUrl: idData?.cover_url ? 'yes' : 'no',
              introduction: idData?.introduction ? 'yes' : 'no'
            });
            return idData as Book;
          }
          
          // Try with lowercase
          const { data: retryData, error: retryError } = await supabase
            .from('books')
            .select()
            .ilike('slug', slug)
            .limit(1);

          if (retryError) {
            console.log('Retry query error:', retryError);
            return null;
          }

          const result = retryData?.[0] || null;
          console.log('Retry query result:', {
            found: !!result,
            hasEpubUrl: result?.epub_file_url ? 'yes' : 'no',
            hasAuthor: result?.author ? 'yes' : 'no',
            hasAuthorId: result?.author_id ? 'yes' : 'no',
            hasCoverUrl: result?.cover_url ? 'yes' : 'no',
            introduction: result?.introduction ? 'yes' : 'no'
          });
          return result as Book;
        }

        console.log('Query result:', {
          found: !!data,
          hasEpubUrl: data?.epub_file_url ? 'yes' : 'no',
          hasAuthor: data?.author ? 'yes' : 'no',
          hasAuthorId: data?.author_id ? 'yes' : 'no',
          hasCoverUrl: data?.cover_url ? 'yes' : 'no',
          introduction: data?.introduction ? 'yes' : 'no'
        });
        return data as Book;
      } catch (error) {
        console.log('Unexpected error in useBook:', error);
        return null;
      }
    },
    enabled: !!slug,
    retry: false,
    retryOnMount: false
  });
};
