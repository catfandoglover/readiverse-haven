
import React from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import VirgilChatButton from "./VirgilChatButton";

interface ContentCardProps {
  image: string;
  title: string;
  about: string;
  onLearnMore: () => void;
  onImageClick?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  itemId: string;
  itemType: "classic" | "icon" | "concept" | "question";
}

const ContentCard: React.FC<ContentCardProps> = ({
  image,
  title,
  about,
  onLearnMore,
  onImageClick,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  itemId,
  itemType
}) => {
  return (
    <div className="flex flex-col h-full p-4 pt-16">
      <div className="relative flex-1 overflow-hidden rounded-lg bg-[#E9E7E2]/5">
        {/* Navigation controls */}
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-4">
          {hasPrevious && onPrevious ? (
            <button
              onClick={onPrevious}
              className="h-10 w-10 rounded-full bg-[#E9E7E2]/10 hover:bg-[#E9E7E2]/20 flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Previous"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          {hasNext && onNext ? (
            <button
              onClick={onNext}
              className="h-10 w-10 rounded-full bg-[#E9E7E2]/10 hover:bg-[#E9E7E2]/20 flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Next"
            >
              <ArrowRight className="h-5 w-5 text-white" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Image */}
        <div 
          className="h-full w-full cursor-pointer"
          onClick={onImageClick}
        >
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        <h2 className="text-2xl font-semibold text-[#E9E7E2]">{title}</h2>
        <p className="text-sm text-[#E9E7E2]/70 line-clamp-3">{about}</p>
        
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onLearnMore}
            className="inline-flex items-center gap-2 text-sm text-[#E9E7E2]/70 hover:text-[#E9E7E2] transition-colors"
          >
            <span>Learn More</span>
            <ExternalLink className="h-4 w-4" />
          </button>
          
          {/* Always show Virgil chat button for consistency across all feed types */}
          <VirgilChatButton 
            contentTitle={title} 
            contentId={itemId} 
            contentType={itemType} 
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
