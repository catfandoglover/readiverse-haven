
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import GreatQuestionDetailedView from "./GreatQuestionDetailedView";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentData, ContentItem } from "@/hooks/useContentData";

interface ForYouContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ForYouLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 pt-16">
    <div className="rounded-lg bg-gray-700 h-64 w-full"></div>
    <div className="h-8 bg-gray-700 rounded w-2/3 mt-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
    <div className="h-4 bg-gray-700 rounded w-11/12 mt-1"></div>
    <div className="h-4 bg-gray-700 rounded w-4/5 mt-1"></div>
  </div>
);

const ForYouContent: React.FC<ForYouContentProps> = ({ 
  currentIndex: initialIndex, 
  onDetailedViewShow, 
  onDetailedViewHide 
}) => {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  // Use our custom hook for data loading
  const { 
    currentItem: itemToShow,
    currentIndex,
    setCurrentIndex,
    items: forYouItems,
    isLoading,
    handleNext,
    handlePrevious,
    hasNext,
    hasPrevious
  } = useContentData({ contentType: 'for-you' });

  // Update index from props if needed
  useEffect(() => {
    if (initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, setCurrentIndex, currentIndex]);

  // Save current path for proper back navigation
  useEffect(() => {
    const currentPath = location.pathname;
    if (!currentPath.includes('/view/')) {
      saveSourcePath(currentPath);
      console.log('[ForYouContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  // Handle URL-based navigation to detailed view
  useEffect(() => {
    if (location.pathname.includes('/view/')) {
      const parts = location.pathname.split('/');
      const type = parts[2] as 'classic' | 'icon' | 'concept' | 'question';
      const id = parts[3];
      
      if (id && (!selectedItem || selectedItem.id !== id)) {
        const item = forYouItems.find(item => item.id === id && item.type === type);
        if (item) {
          console.log(`Found matching ${type} in for-you list:`, item.title || item.name || item.question);
          setSelectedItem(item);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    } else if (selectedItem) {
      setSelectedItem(null);
    }
  }, [location.pathname, forYouItems, selectedItem, onDetailedViewShow]);

  const handleLearnMore = (item: ContentItem) => {
    setSelectedItem(item);
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[ForYouContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/${item.type}/${item.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    
    const sourcePath = getSourcePath();
    console.log("[ForYouContent] Navigating back to:", sourcePath);
    
    navigate(sourcePath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  if (isLoading || !itemToShow) {
    return (
      <div className="h-full">
        <ForYouLoadingSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        {itemToShow && (
          <ContentCard
            image={itemToShow.image || itemToShow.illustration || itemToShow.Cover_super || itemToShow.cover_url || ''}
            title={itemToShow.title || itemToShow.name || itemToShow.question || ''}
            about={itemToShow.about || ""}
            itemId={itemToShow.id}
            itemType={itemToShow.type || 'concept'}
            onLearnMore={() => handleLearnMore(itemToShow)}
            onImageClick={() => handleLearnMore(itemToShow)}
            onPrevious={hasPrevious ? handlePrevious : undefined}
            onNext={hasNext ? handleNext : undefined}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
        )}
      </div>

      {selectedItem && (
        selectedItem.type === 'question' ? (
          <GreatQuestionDetailedView
            data={selectedItem}
            onBack={handleCloseDetailedView}
          />
        ) : (
          <DetailedView
            key={`${selectedItem.type}-detail-${selectedItem.id}`}
            type={selectedItem.type as "classic" | "icon" | "concept"}
            data={selectedItem}
            onBack={handleCloseDetailedView}
          />
        )
      )}
    </>
  );
};

export default ForYouContent;
