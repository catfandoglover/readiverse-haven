
import React, { useState } from "react";
import BookshelfHeader from "./bookshelf/BookshelfHeader";
import BookshelfContent from "./bookshelf/BookshelfContent";
import FavoritesContent from "./bookshelf/FavoritesContent";
import { Compass, LibraryBig, Dna } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";

type TabType = "bookshelf" | "favorites";

const NewBookshelf: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("bookshelf");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleNavigation = (path: string) => {
    if (path === '/bookshelf' && location.pathname !== '/bookshelf') {
      navigate('/bookshelf');
    } else if (path === '/') {
      const lastVisitedDiscover = getLastVisited('discover');
      navigate(lastVisitedDiscover || '/');
    } else if (path === '/dna') {
      const lastVisitedDna = getLastVisited('dna');
      navigate(lastVisitedDna || '/dna');
    } else {
      navigate(path);
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
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
      
      {/* Bottom Navigation */}
      <nav className="shrink-0 border-t border-border bg-background py-2">
        <div className="flex justify-between items-center max-w-sm mx-auto px-8">
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/dna')}
          >
            <Dna className="h-6 w-6" />
            <span className="text-xs font-oxanium">My DNA</span>
          </button>
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs font-oxanium">Discover</span>
          </button>
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <LibraryBig className="h-6 w-6" />
            <span className="text-xs font-oxanium">Bookshelf</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default NewBookshelf;
