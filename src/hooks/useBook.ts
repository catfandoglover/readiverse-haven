import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useBook = (slug: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: book, error: bookError } = await supabase
          .from('books')
          .select(`
            *,
            book_domain!inner(
              domain_id,
              domains(
                name
              )
            ),
            book_author!inner(
              author_id,
              authors(
                name
              )
            )
          `)
          .eq('slug', slug)
          .single();

        if (bookError) {
          setError(bookError);
        }

        setData(book);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [slug]);

  return { data, isLoading, error };
};
