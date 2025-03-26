
import React, { useState } from "react";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/FavoritesContent";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";

type TabType = "bookshelf" | "favorites";

const NewBookshelf: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("bookshelf");
  const location = useLocation();
  const { user } = useAuth();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-screen flex flex-col bg-[#E9E7E2] text-[#2A282A]">
      {/* Header */}
      <BookshelfHeader activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main Content */}
      <div className="flex-1 p-4 pt-32 overflow-hidden">
        <div className="bg-white rounded-xl p-4 h-full overflow-hidden">
          {activeTab === "bookshelf" ? <BookshelfContent /> : <FavoritesContent />}
        </div>
      </div>
    </div>
  );
};

export default NewBookshelf;
