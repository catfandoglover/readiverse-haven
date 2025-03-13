
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Database } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type Book = Database['public']['Tables']['books']['Row'];

const BookshelfContent = () => {
  const navigate = useNavigate();
  const [isGridView, setIsGridView] = useState(false);
  const { user, supabase } = useAuth();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['user-bookshelf', user?.Account?.Uid],
    queryFn: async () => {
      if (!user?.Account?.Uid || !supabase) {
        console.log('No user or Supabase client available');
        return [];
      }

      console.log('Fetching books for user:', user.Account.Uid);

      try {
        // First get the book IDs
        const { data: userBooks, error: userBooksError } = await supabase
          .from('user_books')
          .select('book_id')
          .eq('outseta_user_id', user.Account.Uid);

        if (userBooksError) {
          console.error('Error fetching user books:', {
            error: userBooksError,
            userId: user.Account.Uid
          });
          return [];
        }

        console.log('User books fetched:', userBooks);

        if (!userBooks?.length) {
          console.log('No books found for user');
          return [];
        }

        // Then get the books using those IDs
        const bookIds = userBooks.map(ub => ub.book_id);
        console.log('Fetching books with IDs:', bookIds);

        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('*')
          .in('id', bookIds);

        if (booksError) {
          console.error('Error fetching books:', {
            error: booksError,
            bookIds
          });
          return [];
        }

        console.log('Books fetched successfully:', books);
        return books || [];
      } catch (error) {
        console.error('Unexpected error in book fetching:', error);
        return [];
      }
    },
    enabled: !!user?.Account?.Uid && !!supabase
  });

  const handleBookClick = (slug: string, epub_file_url: string) => {
    if (slug.startsWith('http')) {
      window.location.href = slug;
    } else {
      navigate(`/read/${slug}`, { 
        state: { 
          bookUrl: epub_file_url,
          metadata: {
            coverUrl: null // Add any other metadata needed
          }
        } 
      });
    }
  };

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="px-4 py-4">
        {!books?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Your bookshelf is empty.</p>
            <p>Start reading books to add them to your bookshelf!</p>
          </div>
        ) : isGridView ? (
          <div className={`grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
            {books.map((book) => (
              <div
                key={book.id}
                className="aspect-square cursor-pointer relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 transition-all duration-300"
                onClick={() => handleBookClick(book.slug, book.epub_file_url)}
              >
                <img
                  src={book.cover_url || '/placeholder.svg'}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-md shadow-sm relative z-10"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`space-y-6 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
            {books.map((book) => (
              <Card 
                key={book.id} 
                className="flex gap-4 p-4 hover:bg-accent/50 transition-all duration-300 cursor-pointer bg-card text-card-foreground relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-[1px] after:rounded-md after:bg-card after:z-[0] hover:after:bg-accent/50 [&>*]:relative [&>*]:z-[1]"
                onClick={() => handleBookClick(book.slug, book.epub_file_url)}
              >
                <div className="w-24 h-24 flex-shrink-0 cursor-pointer">
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
    </ScrollArea>
  );
};

export default BookshelfContent;
