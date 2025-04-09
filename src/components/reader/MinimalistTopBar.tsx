import React from 'react';
import { ArrowLeft, MoreVertical, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOriginPath, getPreviousPage } from '@/utils/navigationHistory';

interface MinimalistTopBarProps {
  title: string;
  externalLink: string | null;
  showControls: boolean;
  onMenuClick?: () => void;
  onBookmarkClick?: () => void;
  isBookmarked?: boolean;
}

const MinimalistTopBar: React.FC<MinimalistTopBarProps> = ({ 
  title, 
  externalLink,
  showControls,
  onMenuClick,
  onBookmarkClick,
  isBookmarked = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // First check if we're on a reader page
    const pathParts = location.pathname.split('/');
    const isReaderPage = pathParts.includes('read');

    // If we're on a reader page, always go to book details first
    if (isReaderPage) {
      const hasBooksPath = pathParts.includes('read');
      const slug = hasBooksPath ? pathParts[pathParts.indexOf('read') + 1] : pathParts[pathParts.length - 1];
      
      if (slug && slug.length > 0) {
        navigate(`/texts/${slug}`, {
          state: { 
            fromReader: true,
            bookId: slug
          }
        });
        return;
      }
    }

    // If we're not on a reader page, or couldn't get a valid slug, proceed with normal navigation options
    
    // Check if we have a previous path stored
    const previousPath = getOriginPath();
    
    // If we have a previous path that isn't the current path, navigate to it
    if (previousPath && previousPath !== location.pathname) {
      navigate(previousPath);
      return;
    } 
    
    // If external link exists, open it in a new tab
    if (externalLink) {
      window.open(externalLink, '_blank');
      return;
    }

    // Final fallback to bookshelf
    navigate('/bookshelf');
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 text-white transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <h1 className="font-oxanium text-md font-medium truncate max-w-[70%] mx-auto">{title}</h1>
      
      <div className="flex items-center gap-2">
        {onBookmarkClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBookmarkClick}
            className="text-white hover:bg-white/10"
          >
            <Bookmark 
              className="h-5 w-5" 
              fill={isBookmarked ? "currentColor" : "none"} 
            />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/10"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MinimalistTopBar;
