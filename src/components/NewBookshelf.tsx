
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
    <div className="h-screen flex flex-col bg-[#332E38] text-[#E9E7E2]">
      {/* Header */}
      <BookshelfHeader 
        showFavorites={showFavorites} 
        onToggleFavorites={handleToggleFavorites} 
      />
      
      {/* Hero section */}
      {user && <LastReadBookHero />}
      
      {/* Intellectual DNA Card */}
      <div className="px-4 pt-4">
        <IntellectualDNACard />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {showFavorites ? <FavoritesContent /> : <BookshelfContent />}
      </div>
    </div>
  );
};

export default NewBookshelf;
