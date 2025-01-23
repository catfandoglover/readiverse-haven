import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Home, BookOpen, ShoppingBag, Headphones, Search, MoreHorizontal } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

type Book = Database['public']['Tables']['books']['Row'];

const Library = () => {
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
        <div className="animate-pulse">Loading library...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-georgia">Library</h1>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
        <button className="flex items-center gap-2 mt-4 text-lg text-gray-600">
          Collections
        </button>
      </header>

      {/* Book List */}
      <div className="flex-1 overflow-auto px-4">
        <div className="space-y-6 py-4">
          {books?.map((book) => (
            <Card 
              key={book.id} 
              className="flex gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
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
                  <p className="text-gray-500 text-sm">{book.author}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="border-t bg-white py-2 px-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Library</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Store</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Headphones className="h-6 w-6" />
            <span className="text-xs">Audio</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Search className="h-6 w-6" />
            <span className="text-xs">Search</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Library;