
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
      
      <div className="flex-1 relative overflow-hidden">
        {/* Header Image - removed aspect-[16/9] to prevent cropping */}
        <div className="relative w-full max-h-[40vh]">
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png" 
            alt="Bookshelf Header" 
            className="w-full object-contain"
          />
        </div>
        
        {/* Content Container that overlaps the image - positioned like the Discover feed */}
        <div className="absolute inset-0 pt-[40vh] z-10">
          <div className="p-6 bg-[#E9E7E2] text-[#2A282A] rounded-t-2xl h-full">
            {/* Empty container for now */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookshelf;
