
import React, { useState } from "react";
import { ArrowRight, Share, Star } from "lucide-react";

interface ContentCardProps {
  image: string;
  title: string;
  about: string;
  onLearnMore: () => void;
  onImageClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  image,
  title,
  about,
  onLearnMore,
  onImageClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Function to format text with line breaks
  const formatText = (text: string) => {
    if (!text) return "";
    return text.split("\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        className="relative aspect-square w-full" 
        onClick={onImageClick}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-5 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col rounded-t-2xl mt-1 relative z-10">
        <div className="mb-1">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-serif">{title}</h2>
            <div className="flex gap-1 items-center">
              <button
                className="flex items-center justify-center text-[#2A282A]"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={toggleFavorite}
              >
                <Star 
                  className="h-5 w-5" 
                  fill={isFavorite ? "#EFFE91" : "#E9E7E2"} 
                />
              </button>
              <button
                className="flex items-center justify-center text-[#2A282A]"
                aria-label="Share"
              >
                <Share className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-gray-800 font-baskerville text-lg">{formatText(about)}</p>
        </div>
        
        <div className="py-1 flex items-center justify-start mt-auto">
          <button
            className="uppercase tracking-wider flex items-center gap-1 font-oxanium text-[#282828]/50 pl-0 font-bold text-xs"
            onClick={onLearnMore}
          >
            LEARN MORE
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#282828]/50 text-[#E9E7E2]">
              <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
