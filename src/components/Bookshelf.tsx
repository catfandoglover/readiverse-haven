
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Compass, LibraryBig, Search, Grid, List } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";

type Book = Database['public']['Tables']['books']['Row'];

const Bookshelf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGridView, setIsGridView] = useState(false);
  const { user } = useAuth();
  
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['user-bookshelf', user?.accountUid],
    queryFn: async () => {
      if (!user?.accountUid) return [];

      const { data: bookData, error } = await supabase
        .from('user_books')
        .select(`
          book:book_id (
            id,
            title,
            author,
            cover_url,
            Cover_super,
            slug
          )
        `)
        .eq('outseta_user_id', user.accountUid)
        .order('last_read_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookshelf:', error);
        return [];
      }

      // Transform the nested data structure to match the expected Book type
      return bookData.map(item => item.book) as Book[];
    },
    enabled: !!user?.accountUid,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200">
              <img 
                src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
                alt="Lightning" 
                className="h-5 w-5"
              />
            </button>
            <div className="flex items-center space-x-4">
              <button className="h-10 px-4 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                <span>My Account</span>
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsGridView(false)}
                  className={`h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${!isGridView ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsGridView(true)}
                  className={`h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isGridView ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => handleNavigation('/search')}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </button>
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
            <button 
              className={`h-10 w-14 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/') ? 'border-b-2 border-b-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-none' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-10 w-14 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'border-b-2 border-b-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-none' : ''}`}
              onClick={() => handleNavigation('/bookshelf')}
            >
              <LibraryBig className="h-6 w-6" />
              <span className="text-xs font-oxanium">Bookshelf</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Bookshelf;
