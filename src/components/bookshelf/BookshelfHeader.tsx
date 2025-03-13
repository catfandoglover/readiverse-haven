
import React from "react";
import { Search, Grid, List } from "lucide-react";
import MainMenu from "../navigation/MainMenu";
import { useNavigate } from "react-router-dom";

interface BookshelfHeaderProps {
  activeTab: 'bookshelf' | 'favorites';
  isGridView: boolean;
  setIsGridView: (isGrid: boolean) => void;
  onTabChange: (tab: 'bookshelf' | 'favorites') => void;
}

const BookshelfHeader: React.FC<BookshelfHeaderProps> = ({ 
  activeTab, 
  isGridView, 
  setIsGridView, 
  onTabChange 
}) => {
  const navigate = useNavigate();

  return (
    <header className="shrink-0 px-4 py-3 border-b border-border bg-background">
      <div className="flex justify-between items-center">
        <div className="flex-none">
          <MainMenu />
        </div>
        <div className="flex-1 flex items-center justify-between pl-6">
          <button
            className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-xs ${
              activeTab === "bookshelf" 
                ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]" 
                : "text-[#E9E7E2]/60"
            }`}
            onClick={() => onTabChange("bookshelf")}
          >
            BOOKSHELF
          </button>
          <button
            className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-xs ${
              activeTab === "favorites" 
                ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]" 
                : "text-[#E9E7E2]/60"
            }`}
            onClick={() => onTabChange("favorites")}
          >
            FAVORITES
          </button>
          <div className="flex items-center">
            {/* Layout adjustment icons - commented out for now but preserved for future use
            <div className="flex space-x-4 mr-4">
              <button
                onClick={() => setIsGridView(false)}
                className={`h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${!isGridView ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsGridView(true)}
                className={`h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isGridView ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
            */}
            <button
              onClick={() => navigate('/search')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BookshelfHeader;
