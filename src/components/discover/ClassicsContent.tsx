
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentData, ContentItem } from "@/hooks/useContentData";

interface ClassicsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ClassicLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 pt-16">
    <div className="rounded-lg bg-gray-700 h-64 w-full"></div>
    <div className="h-8 bg-gray-700 rounded w-2/3 mt-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
    <div className="h-4 bg-gray-700 rounded w-11/12 mt-1"></div>
    <div className="h-4 bg-gray-700 rounded w-4/5 mt-1"></div>
  </div>
);

const ClassicsContent: React.FC<ClassicsContentProps> = ({ 
  currentIndex: initialIndex, 
  onDetailedViewShow, 
  onDetailedViewHide 
}) => {
  const [selectedClassic, setSelectedClassic] = useState<ContentItem | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  // Use our custom hook for data loading
  const { 
    currentItem: classicToShow,
    currentIndex,
    setCurrentIndex,
    items: classics,
    isLoading,
    handleNext,
    handlePrevious,
    hasNext,
    hasPrevious
  } = useContentData({ contentType: 'classic' });

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
      console.log('[ClassicsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  // Handle URL-based navigation to detailed view
  useEffect(() => {
    if (location.pathname.includes('/view/classic/')) {
      const classicId = location.pathname.split('/view/classic/')[1];
      
      if (selectedClassic?.id !== classicId) {
        const classic = classics.find(c => c.id === classicId || c.slug === classicId);
        
        if (classic) {
          console.log("Found matching classic in list:", classic.title);
          setSelectedClassic(classic);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    } else if (selectedClassic) {
      setSelectedClassic(null);
    }
  }, [location.pathname, classics, selectedClassic, onDetailedViewShow]);

  const handleLearnMore = (classic: ContentItem) => {
    setSelectedClassic(classic);
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[ClassicsContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/classic/${classic.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedClassic(null);
    
    const sourcePath = getSourcePath();
    console.log("[ClassicsContent] Navigating back to:", sourcePath);
    
    navigate(sourcePath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  if (isLoading || !classicToShow) {
    return (
      <div className="h-full">
        <ClassicLoadingSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        {classicToShow && (
          <ContentCard
            image={classicToShow.image || classicToShow.Cover_super || classicToShow.cover_url || ''}
            title={classicToShow.title || ''}
            about={classicToShow.about || ""}
            itemId={classicToShow.id}
            itemType="classic"
            onLearnMore={() => handleLearnMore(classicToShow)}
            onImageClick={() => handleLearnMore(classicToShow)}
            onPrevious={hasPrevious ? handlePrevious : undefined}
            onNext={hasNext ? handleNext : undefined}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
        )}
      </div>

      {selectedClassic && (
        <DetailedView
          key={`classic-detail-${selectedClassic.id}`}
          type="classic"
          data={selectedClassic}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ClassicsContent;
