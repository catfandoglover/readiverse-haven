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
      <div className="flex-1 overflow-auto pb-20">
        {/* Hero section for last read book */}
        <LastReadBookHero />
        
        {/* Add IntellectualDNACard */}
        <div className="px-4">
          <IntellectualDNACard />
        </div>
        
        {/* Bookshelf content */}
        <BookshelfContent />
      </div>
    </div>
  );
};

export default NewBookshelf;
