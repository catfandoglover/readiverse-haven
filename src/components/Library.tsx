import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { LayoutGrid, List } from "lucide-react";
import BookLinkButton from "./BookLinkButton";
import { Database } from "@/integrations/supabase/types";

type Book = Database['public']['Tables']['books']['Row'];

type ViewMode = 'grid' | 'list';

const Library = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading library...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books?.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-[2/3] relative mb-4">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
                {book.author && (
                  <p className="text-sm text-muted-foreground mb-4">{book.author}</p>
                )}
                <BookLinkButton book={book} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {books?.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex gap-4">
                <div className="w-24 aspect-[2/3] relative flex-shrink-0">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                  {book.author && (
                    <p className="text-sm text-muted-foreground mb-4">{book.author}</p>
                  )}
                  <BookLinkButton book={book} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;