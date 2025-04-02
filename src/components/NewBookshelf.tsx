import React from "react";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import LastReadBookHero from "./bookshelf/LastReadBookHero";
import IntellectualDNACard from "./bookshelf/IntellectualDNACard";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/SupabaseAuthContext";
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
        {/* Main content area with consistent padding */}
        <div className="px-4 flex flex-col gap-4">
          {/* Hero section - responsive layout */}
          {user && (
            isMobile ? (
              // Mobile layout - stacked
              <div className="w-full">
                <LastReadBookHero />
                <div className="mt-4">
                  <IntellectualDNACard />
                </div>
              </div>
            ) : (
              // Desktop layout - side by side with consistent gap
              <div className="grid grid-cols-2 gap-4">
                <LastReadBookHero />
                <IntellectualDNACard />
              </div>
            )
          )}
          
          {/* Main Content */}
          <div className="flex-1 overflow-visible">
            <BookshelfContent />
          </div>
        </div>
        
        {/* Extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default NewBookshelf;
