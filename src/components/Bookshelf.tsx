
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Compass, LibraryBig, Search, Grid, List } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Toggle } from "./ui/toggle";

type Book = Database['public']['Tables']['books']['Row'];

const Bookshelf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGridView, setIsGridView] = useState(false);
  
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['user-bookshelf'],
    queryFn: async () => {
      // Get all library items from localStorage
      const libraryItems = Object.keys(localStorage)
        .filter(key => key.startsWith('book-progress-'))
        .map(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (!data.bookId) return null;
            const urlMatch = data.bookId.match(/gutenberg\.org\/(\d+)$/);
            return urlMatch ? `gutenberg-${urlMatch[1]}` : null;
          } catch (error) {
            console.error('Error parsing localStorage item:', error);
            return null;
          }
        })
        .filter(Boolean);

      if (!libraryItems.length) return [];

      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('slug', libraryItems)
        .order('title');
      
      if (booksError) throw booksError;
      return booksData as Book[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: [],
  });

  const handleBookClick = (slug: string) => {
    navigate(`/${slug}`);
  };

  const handleCoverClick = (coverUrl: string | null, event: React.MouseEvent) => {
    event.stopPropagation();
    if (coverUrl) {
      window.open(coverUrl, '_blank');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 bookshelf-page">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <img 
                src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
                alt="Lightning" 
                className="h-5 w-5"
              />
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4">
                <Toggle
                  pressed={!isGridView}
                  onPressedChange={() => setIsGridView(false)}
                  aria-label="List view"
                  className="h-10 w-10 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                  pressed={isGridView}
                  onPressedChange={() => setIsGridView(true)}
                  aria-label="Grid view"
                  className="h-10 w-10 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  <Grid className="h-4 w-4" />
                </Toggle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                onClick={() => handleNavigation('/search')}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 relative">
          <div className={`px-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {!books?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Your bookshelf is empty.</p>
                <p>Start reading books to add them to your bookshelf!</p>
              </div>
            ) : isGridView ? (
              <div className={`grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
                {books?.map((book) => (
                  <div
                    key={book.id}
                    className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleCoverClick(book.Cover_super, e)}
                  >
                    <img
                      src={book.cover_url || '/placeholder.svg'}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-md shadow-sm"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`space-y-6 py-4 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
                {books?.map((book) => (
                  <Card 
                    key={book.id} 
                    className="flex gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                    onClick={() => handleBookClick(book.slug)}
                  >
                    <div 
                      className="w-24 h-24 flex-shrink-0 cursor-pointer"
                      onClick={(e) => handleCoverClick(book.Cover_super, e)}
                    >
                      <img
                        src={book.cover_url || '/placeholder.svg'}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                      {book.author && (
                        <p className="text-muted-foreground text-sm">{book.author}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2">
          <div className="flex justify-center items-center gap-8 max-w-md mx-auto px-4">
            <Button 
              variant="ghost"
              size="icon" 
              className={`flex flex-col items-center gap-1 w-14 text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/') ? 'border-b-2 border-[#E9E7E2] rounded-none' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </Button>
            <Button 
              variant="ghost"
              size="icon" 
              className={`flex flex-col items-center gap-1 w-14 text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'border-b-2 border-[#E9E7E2] rounded-none' : ''}`}
              onClick={() => handleNavigation('/bookshelf')}
            >
              <LibraryBig className="h-6 w-6" />
              <span className="text-xs font-oxanium">Bookshelf</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Bookshelf;
