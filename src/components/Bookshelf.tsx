
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/FavoritesContent";

const Bookshelf = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'bookshelf' | 'favorites'>('bookshelf');
  const [isGridView, setIsGridView] = useState(false);

  useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const handleTabChange = (tab: 'bookshelf' | 'favorites') => {
    setActiveTab(tab);
  };

  return (
    <div className="h-screen flex flex-col bg-background transition-colors duration-300 bookshelf-page">
      <BookshelfHeader 
        activeTab={activeTab}
        isGridView={isGridView}
        setIsGridView={setIsGridView}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 h-0 overflow-hidden">
        {activeTab === 'bookshelf' ? (
          <BookshelfContent />
        ) : (
          <FavoritesContent />
        )}
      </div>
    </div>
  );
};

export default Bookshelf;
