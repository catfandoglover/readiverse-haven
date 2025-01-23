import { useParams } from "react-router-dom";
import { useBook } from "@/hooks/useBook";
import Reader from "@/components/Reader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading } = useBook(bookSlug);
  const { toast } = useToast();

  useEffect(() => {
    const addToLibrary = async () => {
      if (book?.id) {
        try {
          const { error } = await supabase
            .from('user_library')
            .insert({ book_id: book.id });

          if (error && error.code !== '23505') { // Ignore unique violation errors
            console.error('Error adding book to library:', error);
            toast({
              description: "Failed to add book to library",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error in addToLibrary:', error);
        }
      }
    };

    addToLibrary();
  }, [book?.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading book...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">Book not found</div>
      </div>
    );
  }

  return (
    <Reader
      metadata={{
        coverUrl: book.cover_url || '',
        title: book.title,
        author: book.author || '',
      }}
      preloadedBookUrl={book.epub_file_url}
    />
  );
};

export default Index;