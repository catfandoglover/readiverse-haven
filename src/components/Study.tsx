
import React, { useState } from "react";
import { Compass, LibraryBig, Dna } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import StudyHeader from "./study/StudyHeader";
import HeroSection from "./study/HeroSection";
import ShelfSection from "./study/ShelfSection";
import BookCarousel from "./study/BookCarousel";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useBookCollection, useFavoriteBooks } from "@/hooks/useBookCollection";

const Study: React.FC = () => {
  const [isInFavorites, setIsInFavorites] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  // Fetch books for both shelves and carousel
  const { data: allBooks = [], isLoading: isLoadingAllBooks } = useBookCollection();
  const { data: dnaBooks = [], isLoading: isLoadingDnaBooks } = useBookCollection("epistemology");
  const { data: ethicsBooks = [], isLoading: isLoadingEthicsBooks } = useBookCollection("ethics");
  const { data: favoriteBooks = [], isLoading: isLoadingFavorites } = useFavoriteBooks();

  const handleToggleFavorites = () => {
    setIsInFavorites(!isInFavorites);
  };

  const handleNavigation = (path: string) => {
    if (path === '/bookshelf' && location.pathname !== '/bookshelf') {
      navigate('/bookshelf');
    } else if (path === '/') {
      const lastVisitedDiscover = getLastVisited('discover');
      navigate(lastVisitedDiscover || '/');
    } else if (path === '/dna') {
      const lastVisitedDna = getLastVisited('dna');
      navigate(lastVisitedDna || '/dna');
    } else {
      navigate(path);
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen flex flex-col bg-[#2A282A] text-[#E9E7E2]">
      {/* Header */}
      <StudyHeader isInFavorites={isInFavorites} onToggleFavorites={handleToggleFavorites} />
      
      {/* Main Content */}
      <main className="flex-1 pt-32 pb-16 px-4 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-screen-xl mx-auto">
            {!isInFavorites ? (
              <>
                {/* Hero Section - Last Read Book */}
                <HeroSection />
                
                {/* Intellectual DNA Shelf */}
                <ShelfSection 
                  title="Intellectual DNA"
                  books={dnaBooks}
                  isLoading={isLoadingDnaBooks}
                  viewAllLink="/bookshelf/domain/epistemology"
                  limit={4}
                />
                
                {/* Ethics Shelf */}
                <ShelfSection 
                  title="Ethics"
                  books={ethicsBooks}
                  isLoading={isLoadingEthicsBooks}
                  viewAllLink="/bookshelf/domain/ethics"
                  limit={4}
                />
                
                <Separator className="my-8 bg-[#E9E7E2]/20" />
                
                {/* All Books Carousel/List */}
                <BookCarousel 
                  books={allBooks}
                  isLoading={isLoadingAllBooks}
                />
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-oxanium mb-6">Your Favorites</h2>
                  {isLoadingFavorites ? (
                    <p>Loading favorites...</p>
                  ) : favoriteBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {favoriteBooks.map((book) => (
                        <BookCard
                          key={book.id}
                          id={book.id}
                          title={book.title}
                          author={book.author}
                          cover_url={book.cover_url}
                          slug={book.slug}
                          epub_file_url={book.epub_file_url}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-[#E9E7E2]/70">
                      <p>No favorites yet. Add books to your favorites to see them here.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="shrink-0 border-t border-[#E9E7E2]/10 bg-[#2A282A] py-2">
        <div className="flex justify-between items-center max-w-sm mx-auto px-8">
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 hover:text-[#E9E7E2] transition-all duration-200 ${isCurrentPath('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/dna')}
          >
            <Dna className="h-6 w-6" />
            <span className="text-xs font-oxanium">My DNA</span>
          </button>
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 hover:text-[#E9E7E2] transition-all duration-200 ${isCurrentPath('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs font-oxanium">Discover</span>
          </button>
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 hover:text-[#E9E7E2] transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <LibraryBig className="h-6 w-6" />
            <span className="text-xs font-oxanium">Study</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Study;
