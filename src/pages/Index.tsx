import { useParams } from "react-router-dom";
import { useBook } from "@/hooks/useBook";
import Reader from "@/components/Reader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { triggerNotionSync } from "@/utils/notionSync";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading } = useBook(bookSlug);
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      toast({
        description: "Starting Notion sync...",
      });
      await triggerNotionSync();
      toast({
        description: "Notion sync completed successfully",
      });
    } catch (error) {
      console.error('Error triggering Notion sync:', error);
      toast({
        description: "Failed to sync with Notion",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const addToLibrary = async () => {
      if (book?.id) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            console.error('No authenticated user found');
            return;
          }

          const { error } = await supabase
            .from('user_library')
            .insert({
              book_id: book.id,
              user_id: user.id
            });

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
    <div>
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleSync}>
          Sync Notion Questions
        </Button>
      </div>
      <Reader
        metadata={{
          coverUrl: book.cover_url || '',
          title: book.title,
          author: book.author || '',
        }}
        preloadedBookUrl={book.epub_file_url}
      />
    </div>
  );
};

export default Index;