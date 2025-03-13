
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/favorites/FavoritesContent";

type TabType = "bookshelf" | "favorites";

const Bookshelf = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("bookshelf");
  const { user, supabase } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerHeight = 152; // Match the header height

  useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrolled(scrollTop > 10);
  };

  return (
    <div className="h-screen flex flex-col bg-[#2A282A] transition-colors duration-300 bookshelf-page">
      {/* Header is now fixed at the top */}
      <BookshelfHeader activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* This spacer ensures content starts below the fixed header */}
      <div style={{ height: headerHeight }} className="flex-none"></div>
      
      <div className="flex-1 relative overflow-hidden">
        {/* Hero Image */}
        <div 
          className="w-full transition-opacity duration-300"
          style={{ 
            opacity: scrolled ? 0 : 1,
            height: scrolled ? 0 : "auto",
            overflow: "hidden"
          }}
        >
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png" 
            alt="Bookshelf Header" 
            className="w-full object-contain"
          />
        </div>
        
        {/* Scrollable Content Container */}
        <div 
          ref={contentRef}
          className={`bg-[#E9E7E2] text-[#2A282A] rounded-t-2xl transition-all duration-300 flex flex-col overflow-hidden`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: scrolled ? headerHeight : "auto",
            maxHeight: scrolled ? "calc(100vh - " + headerHeight + "px)" : "calc(100vh - " + headerHeight + "px - 150px)",
            zIndex: 20,
          }}
        >
          <ScrollArea 
            className="flex-1 h-full"
            onScrollCapture={handleScroll}
          >
            <div className="min-h-full">
              {activeTab === "bookshelf" && <BookshelfContent />}
              {activeTab === "favorites" && <FavoritesContent />}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Bookshelf;
