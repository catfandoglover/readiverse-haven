
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import BookshelfHeader from "./bookshelf/BookshelfHeader";

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
      
      <div className="flex-1 pt-[152px] relative overflow-hidden">
        {/* Header Image */}
        <div className="relative w-full aspect-[16/9] max-h-[40vh]">
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png" 
            alt="Bookshelf Header" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Container that overlaps the image */}
        <div className="relative z-10 -mt-6 mx-4">
          <div className="p-6 bg-[#E9E7E2] text-[#2A282A] rounded-t-2xl min-h-[50vh]">
            {/* Empty container for now */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookshelf;
