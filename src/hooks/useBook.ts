import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

export const useBook = (slug: string | undefined) => {
  return useQuery<Book | null>({
    queryKey: ['book', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Fetched book data:', data);
      return data;
    },
    enabled: !!slug
  });
};
