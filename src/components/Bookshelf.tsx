
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Compass, LibraryBig, Search, Grid, List, Dna } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate, useLocation } from "react-router-dom";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";

type Book = Database['public']['Tables']['books']['Row'];

const Bookshelf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGridView, setIsGridView] = useState(false);
  const { user, supabase } = useAuth();

  useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['user-bookshelf', user?.Account?.Uid],
    queryFn: async () => {
      if (!user?.Account?.Uid || !supabase) {
        return [];
      }

      try {
        const { data: userBooks, error } = await supabase
          .from('user_books')
          .select(`
            books (
              id,
              title,
              author,
              cover_url,
              Cover_super,
              slug
            )
          `)
          .eq('outseta_user_id', user.Account.Uid);

        if (error) {
          console.error('Error fetching books:', error);
          return [];
        }

        // Extract books from the joined data and filter out any null values
        const books = userBooks
          ?.map(ub => ub.books)
          .filter((book): book is Book => book !== null) || [];
        
        console.log('Fetched books:', books);
        return books;

      } catch (error) {
        console.error('Unexpected error in books fetch:', error);
        return [];
      }
    },
    enabled: !!user?.Account?.Uid && !!supabase
  });

  const handleBookClick = (slug?: string) => {
    if (slug) {
      navigate(`/${slug}`);
    }
  };

  const handleCoverClick = (coverSuper: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (coverSuper) {
      window.open(coverSuper, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 bookshelf-page">
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <LibraryBig className="h-6 w-6" />
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <button className="inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
                  <span className="hidden lg:inline-flex">Search your library...</span>
                  <span className="inline-flex lg:hidden">Search...</span>
                  <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGridView(false)}
                  className={`rounded-md p-2 hover:bg-accent ${!isGridView ? 'bg-accent' : ''}`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsGridView(true)}
                  className={`rounded-md p-2 hover:bg-accent ${isGridView ? 'bg-accent' : ''}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
              </div>
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
                    className="aspect-square cursor-pointer relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 transition-all duration-300"
                    onClick={(e) => handleCoverClick(book.Cover_super, e)}
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
              <div className={`space-y-6 py-4 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
                {books?.map((book) => (
                  <Card 
                    key={book.id} 
                    className="flex gap-4 p-4 hover:bg-accent/50 transition-all duration-300 cursor-pointer bg-card text-card-foreground relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-[1px] after:rounded-md after:bg-card after:z-[0] hover:after:bg-accent/50 [&>*]:relative [&>*]:z-[1]"
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

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container flex h-16 items-center justify-around">
            <button
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-accent"
              onClick={() => navigate('/')}
            >
              <Compass className="h-5 w-5" />
              <span className="text-xs mt-1">Discover</span>
            </button>
            <button
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-accent"
              onClick={() => navigate('/bookshelf')}
            >
              <LibraryBig className="h-5 w-5" />
              <span className="text-xs mt-1">Library</span>
            </button>
            <button
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-accent"
              onClick={() => navigate('/dna')}
            >
              <Dna className="h-5 w-5" />
              <span className="text-xs mt-1">DNA</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Bookshelf;
