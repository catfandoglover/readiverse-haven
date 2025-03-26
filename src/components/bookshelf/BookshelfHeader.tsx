
import React from "react";
import { Heart } from "lucide-react";
import MainMenu from "../navigation/MainMenu";
import { useNavigate } from "react-router-dom";

interface BookshelfHeaderProps {
  className?: string;
}

const BookshelfHeader: React.FC<BookshelfHeaderProps> = ({ 
  className = ""
}) => {
  const navigate = useNavigate();

  const handleFavoritesClick = () => {
    navigate("/favorites-shelf");
  };

  return (
    <div className={`flex items-center pt-4 pb-4 px-8 bg-[#332E38] text-[#E9E7E2] ${className}`}>
      <MainMenu />
      <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
        STUDY
      </h2>
      <div>
        <button 
          onClick={handleFavoritesClick}
          aria-label="View Favorites"
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50 flex items-center justify-center"
        >
          <Heart className="h-5 w-5 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default BookshelfHeader;
