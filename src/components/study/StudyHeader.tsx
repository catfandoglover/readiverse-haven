
import React from "react";
import { Heart, BookOpen, Search } from "lucide-react";
import MainMenu from "../navigation/MainMenu";
import { LoginButtons } from "@/components/auth/LoginButtons";

interface StudyHeaderProps {
  isInFavorites: boolean;
  onToggleFavorites: () => void;
}

const StudyHeader: React.FC<StudyHeaderProps> = ({ 
  isInFavorites, 
  onToggleFavorites 
}) => {
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
        <div className="flex-1 flex items-center space-x-8 pl-5">
          <h1 className="text-[#E9E7E2] font-oxanium text-lg">
            {isInFavorites ? "Favorites" : "Study"}
          </h1>
          <div className="flex-1 flex justify-end items-center gap-4">
            <button 
              className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#E9E7E2]/90 text-[#2A282A]"
              aria-label={isInFavorites ? "View Bookshelf" : "View Favorites"}
              onClick={onToggleFavorites}
            >
              {isInFavorites ? <BookOpen className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
            </button>
            <button 
              className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#E9E7E2]/90 text-[#2A282A]"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <LoginButtons />
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudyHeader;
