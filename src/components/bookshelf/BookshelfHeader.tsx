
import React from "react";
import { Search } from "lucide-react";
import MainMenu from "../navigation/MainMenu";

type TabType = "bookshelf" | "favorites";

interface BookshelfHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BookshelfHeader: React.FC<BookshelfHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header 
      className="absolute top-0 left-0 right-0 z-10 bg-[#2A282A]/40 backdrop-blur-sm"
      style={{
        aspectRatio: "1290/152",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        maxHeight: "152px"
      }}
    >
      <div className="flex items-center px-4 py-3 h-full w-full">
        <div className="flex-none">
          <MainMenu />
        </div>
        <div className="flex-1 flex items-center space-x-8 pl-8">
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
          <div className="flex-1 flex justify-end">
            <button 
              className="h-4 w-4 inline-flex items-center justify-center rounded-full bg-[#E9E7E2]/90 text-[#2A282A]"
              aria-label="Search"
            >
              <Search className="h-2 w-2" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BookshelfHeader;
