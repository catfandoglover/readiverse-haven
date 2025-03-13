
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/FavoritesContent";

type TabType = "bookshelf" | "favorites";

const Bookshelf = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("bookshelf");
  const { user, supabase } = useAuth();

  useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-screen flex flex-col bg-[#2A282A] transition-colors duration-300 bookshelf-page">
      <BookshelfHeader activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 relative overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header Image - removed aspect-[16/9] to prevent cropping */}
          <div className="relative w-full">
            <img 
              src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png" 
              alt="Bookshelf Header" 
              className="w-full object-contain"
            />
          </div>
          
          {/* Content Container that overlaps the image - using the same approach as ContentCard */}
          <div className="p-6 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col rounded-t-2xl -mt-6 relative z-10">
            {activeTab === "bookshelf" ? <BookshelfContent /> : <FavoritesContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookshelf;
