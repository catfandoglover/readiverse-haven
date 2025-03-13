
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "./ui/scroll-area";
import { Database } from "@/integrations/supabase/types";
import { useNavigate, useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookCard from "./bookshelf/BookCard";

type Book = Database['public']['Tables']['books']['Row'];
type TabType = "bookshelf" | "favorites";

const Bookshelf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("bookshelf");
  const { user, supabase } = useAuth();

  useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['user-bookshelf', user?.Account?.Uid, activeTab],
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

  const handleCoverClick = (coverUrl: string | null, event: React.MouseEvent) => {
    event.stopPropagation();
    if (coverUrl) {
      window.open(coverUrl, '_blank');
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-screen flex flex-col bg-[#2A282A] transition-colors duration-300 bookshelf-page">
      <BookshelfHeader activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 pt-[152px] relative">
        <ScrollArea className="h-full">
          <div className="px-4 py-4">
            {!books?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Your bookshelf is empty.</p>
                <p>Start reading books to add them to your bookshelf!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    coverUrl={book.cover_url}
                    title={book.title}
                    author={book.author}
                    onClick={() => handleBookClick(book.slug, book.epub_file_url)}
                    onImageClick={(e) => handleCoverClick(book.Cover_super, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Bookshelf;
