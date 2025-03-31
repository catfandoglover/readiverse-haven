
import React from "react";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import LastReadBookHero from "./bookshelf/LastReadBookHero";
import IntellectualDNACard from "./bookshelf/IntellectualDNACard";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const NewBookshelf: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen h-full bg-[#332E38] text-[#E9E7E2]">
      {/* Header */}
      <BookshelfHeader className="sticky top-0 z-10" />
      
      {/* Scrollable container for the rest of the content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top section - responsive layout */}
        {user && (
          isMobile ? (
            // Mobile layout - stacked
            <div className="w-full">
              <LastReadBookHero />
              <div className="px-4">
                <IntellectualDNACard />
              </div>
            </div>
          ) : (
            // Desktop layout - side by side
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="w-full">
                <LastReadBookHero />
              </div>
              <div className="w-full">
                <IntellectualDNACard />
              </div>
            </div>
          )
        )}
        
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-visible">
          <BookshelfContent />
        </div>
        
        {/* Extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default NewBookshelf;
