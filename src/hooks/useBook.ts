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
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('slug', slug.toLowerCase())
          .maybeSingle();

        if (error) {
          console.error('Error fetching book:', error);
          return null;
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