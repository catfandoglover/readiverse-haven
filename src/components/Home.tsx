
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Database } from "@/integrations/supabase/types";
import { Button } from "./ui/button";
import { Compass, LibraryBig, Search, Grid, List } from "lucide-react";
import { Toggle } from "./ui/toggle";
import QuestionsCards from "./QuestionsCards";
import { useNavigate } from "react-router-dom";

type Book = Database['public']['Tables']['books']['Row'];

const Home = () => {
  const [isGridView, setIsGridView] = useState(false);
  const navigate = useNavigate();
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Book[];
    },
    staleTime: 30000,
    refetchOnMount: false
  });

  const handleBookClick = (coverUrl: string | null) => {
    if (coverUrl) {
      window.open(coverUrl, '_blank');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 home-page">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-georgia text-foreground">Discover</h1>
            <div className="flex gap-4 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground"
                onClick={() => handleNavigation('/search')}
              >
                <Search className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                <Toggle
                  pressed={!isGridView}
                  onPressedChange={() => setIsGridView(false)}
                  aria-label="List view"
                  className="text-foreground"
                >
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                  pressed={isGridView}
                  onPressedChange={() => setIsGridView(true)}
                  aria-label="Grid view"
                  className="text-foreground"
                >
                  <Grid className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 relative">
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <QuestionsCards />
            
            <div className="px-4 pb-24">
              {isGridView ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
                  {books?.map((book) => (
                    <div
                      key={book.id}
                      className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleBookClick(book.Cover_super)}
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
                <div className="space-y-6 py-4">
                  {books?.map((book) => (
                    <Card 
                      key={book.id} 
                      className="flex gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                      onClick={() => handleBookClick(book.Cover_super)}
                    >
                      <div className="w-24 h-24 flex-shrink-0">
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
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2">
          <div className="flex justify-center items-center gap-8 max-w-md mx-auto px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex flex-col items-center gap-1 w-14 text-foreground"
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs">Discover</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex flex-col items-center gap-1 w-14 text-foreground"
              onClick={() => handleNavigation('/bookshelf')}
            >
              <LibraryBig className="h-6 w-6" />
              <span className="text-xs">Bookshelf</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Home;
