
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentCardProps {
  title: string;
  image: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  type?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  image,
  description,
  onClick,
  className = '',
  type,
  isFavorite,
  onFavoriteToggle
}) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div 
        className={`bg-[#2A282A] rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${className}`}
        onClick={onClick}
      >
        <div className="relative w-full aspect-[16/9]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          {type && (
            <span className="absolute top-2 left-2 bg-[#373763]/80 text-[#E9E7E2] text-xs px-2 py-1 rounded">
              {type}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-[#E9E7E2] font-libre-baskerville text-lg font-medium mb-2 line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-[#C8C8C9] text-sm line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Desktop horizontal layout
  return (
    <div 
      className={`flex bg-[#2A282A] rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-[#373740] ${className}`}
      onClick={onClick}
    >
      <div className="relative w-1/3 min-w-[180px]">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        {type && (
          <span className="absolute top-2 left-2 bg-[#373763]/80 text-[#E9E7E2] text-xs px-2 py-1 rounded">
            {type}
          </span>
        )}
      </div>
      <div className="p-5 flex-1">
        <h3 className="text-[#E9E7E2] font-libre-baskerville text-xl font-medium mb-3 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-[#C8C8C9] text-base line-clamp-3">{description}</p>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
