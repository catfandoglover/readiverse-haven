
import React, { useState } from "react";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/FavoritesContent";
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
      
      {/* Main Content */}
      <div className="flex-1 p-4 pt-16 overflow-hidden">
        <div className="bg-white rounded-xl p-4 h-full overflow-hidden text-[#2A282A]">
          {showFavorites ? <FavoritesContent /> : <BookshelfContent />}
        </div>
      </div>
    </div>
  );
};

export default NewBookshelf;
