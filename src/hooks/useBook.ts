
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

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
            hasEpubUrl: result?.epub_file_url ? 'yes' : 'no'
          });
          return result;
        }

        console.log('Query result:', {
          found: !!data,
          hasEpubUrl: data?.epub_file_url ? 'yes' : 'no'
        });
        return data;
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
