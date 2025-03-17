
import React, { useState } from "react";
import { ArrowUp, ArrowDown, Share, Star } from "lucide-react";

interface ContentCardProps {
  image: string;
  title: string;
  about: string;
  onLearnMore: () => void;
  onImageClick: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  image,
  title,
  about,
  onLearnMore,
  onImageClick,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
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
    <div className="flex flex-col h-full relative">
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
      <div className="p-4 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col rounded-t-3xl -mt-24 relative z-10">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-serif">{title}</h2>
            <div className="flex gap-1 items-center">
              <button
                className="flex items-center justify-center text-[#2A282A]"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={toggleFavorite}
              >
                <Star 
                  className="h-6 w-6" 
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
        
        <div className="py-1 flex items-center justify-start">
          <button
            className="uppercase tracking-wider flex items-center gap-1 font-oxanium text-[#282828]/50 pl-0 font-bold text-base"
            onClick={onLearnMore}
          >
            <span className="flex items-center">
              LEARN MORE
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#282828]/50 text-[#E9E7E2] ml-3">
                <ArrowUp className="h-4 w-4" />
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Fixed navigation buttons at bottom of screen */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            hasPrevious ? 'bg-[#282828]/50 hover:bg-[#282828]/70' : 'bg-[#282828]/20'
          } text-[#E9E7E2] transition-colors`}
          aria-label="Previous"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            hasNext ? 'bg-[#282828]/50 hover:bg-[#282828]/70' : 'bg-[#282828]/20'
          } text-[#E9E7E2] transition-colors`}
          aria-label="Next"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
