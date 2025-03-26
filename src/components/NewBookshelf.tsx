
import React, { useState } from "react";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/FavoritesContent";
import LastReadBookHero from "./bookshelf/LastReadBookHero";
import IntellectualDNACard from "./bookshelf/IntellectualDNACard";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const NewBookshelf: React.FC = () => {
  const [showFavorites, setShowFavorites] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const handleToggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  return (
    <div className="flex flex-col min-h-screen h-full bg-[#332E38] text-[#E9E7E2]">
      {/* Header */}
      <BookshelfHeader 
        showFavorites={showFavorites} 
        onToggleFavorites={handleToggleFavorites} 
        className="sticky top-0 z-10"
      />
      
      {/* Scrollable container for the rest of the content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Hero section */}
        {user && <LastReadBookHero />}
        
        {/* Intellectual DNA Card */}
        <div className="px-4 pt-4">
          <IntellectualDNACard />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-visible">
          {showFavorites ? <FavoritesContent /> : <BookshelfContent />}
        </div>
        
        {/* Extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default NewBookshelf;
