import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

export const useBook = (slug: string | undefined) => {
  return useQuery<Book | null>({
    queryKey: ['book', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      try {
        // Try direct query with proper headers
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('slug', slug.toLowerCase()) // Ensure lowercase comparison
          .single();

        if (error) {
          console.error('Initial query error:', error);
          // If first query fails, try alternative approach
          const { data: retryData, error: retryError } = await supabase
            .from('books')
            .select()
            .filter('slug', 'eq', slug)
            .limit(1);

          if (retryError) {
            console.error('Retry query error:', retryError);
            return null;
          }

          return retryData?.[0] || null;
        }

        return data;
      } catch (error) {
        console.error('Unexpected error in useBook:', error);
        return null;
      }
    },
    enabled: !!slug,
    retry: false,
    retryOnMount: false
  });
};
