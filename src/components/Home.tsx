import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Compass, BookOpen, Search, Grid, List } from "lucide-react";
import { Toggle } from "./ui/toggle";

type Book = Database['public']['Tables']['books']['Row'];

const Home = () => {
  const navigate = useNavigate();
  const [isGridView, setIsGridView] = useState(false);
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Book[];
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
        <div className="animate-pulse">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="px-6 py-8 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-georgia text-foreground">Discover</h1>
          <div className="flex gap-2">
            <Toggle
              pressed={!isGridView}
              onPressedChange={() => setIsGridView(false)}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={isGridView}
              onPressedChange={() => setIsGridView(true)}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-16">
        {isGridView ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
            {books?.map((book) => (
              <div
                key={book.id}
                className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleBookClick(book.slug)}
              >
                <img
                  src={book.cover_url || '/placeholder.svg'}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-md shadow-sm"
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
            ))}
          </div>
        )}
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

export default Home;