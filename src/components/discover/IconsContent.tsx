
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentData, ContentItem } from "@/hooks/useContentData";

interface IconsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const IconLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 pt-16">
    <div className="rounded-lg bg-gray-700 h-64 w-full"></div>
    <div className="h-8 bg-gray-700 rounded w-2/3 mt-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
    <div className="h-4 bg-gray-700 rounded w-11/12 mt-1"></div>
    <div className="h-4 bg-gray-700 rounded w-4/5 mt-1"></div>
  </div>
);

const IconsContent: React.FC<IconsContentProps> = ({ 
  currentIndex: initialIndex, 
  onDetailedViewShow, 
  onDetailedViewHide 
}) => {
  const [selectedIcon, setSelectedIcon] = useState<ContentItem | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  // Use our custom hook for data loading
  const { 
    currentItem: iconToShow,
    currentIndex,
    setCurrentIndex,
    items: icons,
    isLoading,
    handleNext,
    handlePrevious,
    hasNext,
    hasPrevious
  } = useContentData({ contentType: 'icon' });

  // Update index from props if needed
  useEffect(() => {
    if (initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, setCurrentIndex, currentIndex]);

  // Save the current path for proper back navigation
  useEffect(() => {
    const currentPath = location.pathname;
    if (!currentPath.includes('/view/')) {
      saveSourcePath(currentPath);
      console.log('[IconsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  // Handle URL-based navigation to detailed view
  useEffect(() => {
    if (location.pathname.includes('/view/icon/')) {
      const iconId = location.pathname.split('/view/icon/')[1];
      
      if (selectedIcon?.id !== iconId) {
        const icon = icons.find(i => i.id === iconId || i.slug === iconId);
        
        if (icon) {
          console.log("Found matching icon in list:", icon.title || icon.name);
          setSelectedIcon(icon);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    } else if (selectedIcon) {
      setSelectedIcon(null);
    }
  }, [location.pathname, icons, selectedIcon, onDetailedViewShow]);

  const handleLearnMore = (icon: ContentItem) => {
    setSelectedIcon(icon);
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[IconsContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/icon/${icon.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedIcon(null);
    
    const sourcePath = getSourcePath();
    console.log("[IconsContent] Navigating back to:", sourcePath);
    
    navigate(sourcePath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  if (isLoading || !iconToShow) {
    return (
      <div className="h-full">
        <IconLoadingSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        {iconToShow && (
          <ContentCard
            image={iconToShow.image || iconToShow.illustration || ''}
            title={iconToShow.title || iconToShow.name || ''}
            about={iconToShow.about || ""}
            itemId={iconToShow.id}
            itemType="icon"
            onLearnMore={() => handleLearnMore(iconToShow)}
            onImageClick={() => handleLearnMore(iconToShow)}
            onPrevious={hasPrevious ? handlePrevious : undefined}
            onNext={hasNext ? handleNext : undefined}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
        )}
      </div>

      {selectedIcon && (
        <DetailedView
          key={`icon-detail-${selectedIcon.id}`}
          type="icon"
          data={selectedIcon}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default IconsContent;
