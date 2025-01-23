import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Book = Database['public']['Tables']['books']['Row'];

const Home = () => {
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
    }
  });

  const handleBookClick = (slug: string) => {
    navigate(`/${slug}`);
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
        <h1 className="text-4xl font-georgia text-foreground">Home</h1>
      </header>

      <div className="flex-1 overflow-auto px-4">
        <div className="space-y-6 py-4">
          {books?.map((book) => (
            <Card 
              key={book.id} 
              className="flex gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
              onClick={() => handleBookClick(book.slug)}
            >
              <div className="w-16 h-24 flex-shrink-0">
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
      </div>
    </div>
  );
};

export default Home;