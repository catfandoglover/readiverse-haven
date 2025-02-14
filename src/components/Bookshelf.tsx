import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Compass, LibraryBig, Search, Grid, List, Dna } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate, useLocation } from "react-router-dom";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { LoginButtons } from "@/components/auth/LoginButtons";

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
      if (!user?.Account?.Uid || !supabase) return [];

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
        .eq('outseta_user_id', user.Account.Uid)
        .order('last_read_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookshelf:', error);
        return [];
      }

      return bookData.map(item => item.book) as Book[];
    },
    enabled: !!user?.Account?.Uid && !!supabase,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
    if (path === '/bookshelf' && location.pathname !== '/bookshelf') {
      navigate('/bookshelf');
    } else if (path === '/') {
      navigate(getLastVisited('discover'));
    } else if (path === '/dna') {
      navigate(getLastVisited('dna'));
    } else {
      navigate(path);
    }
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
              <LoginButtons />
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

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 z-50">
          <div className="flex justify-between items-center max-w-sm mx-auto px-8">
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/dna')}
            >
              <Dna className="h-6 w-6" />
              <span className="text-xs font-oxanium">My DNA</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
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
