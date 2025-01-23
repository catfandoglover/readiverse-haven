import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Compass, BookOpen, Search } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

type Book = Database['public']['Tables']['books']['Row'];

const Library = () => {
  const navigate = useNavigate();
  const { data: books, isLoading } = useQuery({
    queryKey: ['user-library'],
    queryFn: async () => {
      const { data: libraryData, error: libraryError } = await supabase
        .from('user_library')
        .select('book_id');
      
      if (libraryError) throw libraryError;
      
      if (!libraryData?.length) return [];

      const bookIds = libraryData.map(item => item.book_id);
      
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds)
        .order('title');
      
      if (booksError) throw booksError;
      return booksData as Book[];
    }
  });

  const handleBookClick = (slug: string) => {
    navigate(`/${slug}`);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading library...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="px-6 py-8 border-b border-border">
        <h1 className="text-4xl font-georgia text-foreground">Library</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-16">
        <div className="space-y-6 py-4">
          {books?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Your library is empty.</p>
              <p>Start reading books to add them to your library!</p>
            </div>
          ) : (
            books?.map((book) => (
              <Card 
                key={book.id} 
                className="flex gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                onClick={() => handleBookClick(book.slug)}
              >
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-md shadow-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                  {book.author && (
                    <p className="text-muted-foreground text-sm">{book.author}</p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2">
        <div className="flex justify-between items-center max-w-md mx-auto px-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex flex-col items-center gap-1 w-16"
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs">Discover</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex flex-col items-center gap-1 w-16"
            onClick={() => handleNavigation('/library')}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Library</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex flex-col items-center gap-1 w-16"
          >
            <Search className="h-6 w-6" />
            <span className="text-xs">Search</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Library;