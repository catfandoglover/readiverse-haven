
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import useFavorites from '@/hooks/useFavorites';

interface ContentCardProps {
  id: string;
  type: 'icon' | 'concept' | 'classic' | 'question';
  title: string;
  subtitle?: string;
  image?: string;
  slug?: string;
  className?: string;
  imageClassName?: string;
  showFavoriteButton?: boolean;
  onClick?: () => void;
}

// Create base backdrop styles for each content type
const contentBackdrops = {
  icon: "bg-gradient-to-br from-blue-600/10 to-indigo-700/10 border-blue-500/30",
  concept: "bg-gradient-to-br from-purple-600/10 to-pink-700/10 border-purple-500/30",
  classic: "bg-gradient-to-br from-amber-600/10 to-orange-700/10 border-amber-500/30",
  question: "bg-gradient-to-br from-emerald-600/10 to-teal-700/10 border-emerald-500/30"
};

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  type,
  title,
  subtitle,
  image,
  slug,
  className,
  imageClassName,
  showFavoriteButton = true,
  onClick
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(id, type);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // Default navigation based on content type
    if (slug) {
      let path = '';
      
      switch (type) {
        case 'icon':
          path = `/icons/${slug}`;
          break;
        case 'concept':
          path = `/concepts/${slug}`;
          break;
        case 'classic':
          path = `/texts/${slug}`;
          break;
        case 'question':
          path = `/discover/questions/${id}`;
          break;
        default:
          return;
      }
      
      navigate(path);
    }
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite();
  };
  
  return (
    <div 
      className={cn(
        "relative group flex flex-col h-full cursor-pointer rounded-xl p-2 border transition-all duration-300",
        contentBackdrops[type],
        {
          "transform-gpu -translate-y-1": isHovered,
          "shadow-lg": isHovered
        },
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showFavoriteButton && user && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300",
            { "opacity-100": isHovered || isFavorite }
          )}
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors duration-300",
              isFavorite ? "text-red-500 fill-red-500" : "text-white"
            )} 
          />
        </Button>
      )}
      
      <div 
        className={cn(
          "relative aspect-square overflow-hidden rounded-lg mb-2",
          imageClassName
        )}
      >
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-black/20 text-white font-medium">
            {title.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="flex-1 p-1">
        <h3 className="text-sm font-semibold line-clamp-2 mb-1">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 line-clamp-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
