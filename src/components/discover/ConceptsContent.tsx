
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentData, ContentItem } from "@/hooks/useContentData";

interface ConceptsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ConceptLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 pt-16">
    <div className="rounded-lg bg-gray-700 h-64 w-full"></div>
    <div className="h-8 bg-gray-700 rounded w-2/3 mt-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
    <div className="h-4 bg-gray-700 rounded w-11/12 mt-1"></div>
    <div className="h-4 bg-gray-700 rounded w-4/5 mt-1"></div>
  </div>
);

const ConceptsContent: React.FC<ConceptsContentProps> = ({ 
  currentIndex: initialIndex, 
  onDetailedViewShow, 
  onDetailedViewHide 
}) => {
  const [selectedConcept, setSelectedConcept] = useState<ContentItem | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  // Use our custom hook for data loading
  const { 
    currentItem: conceptToShow,
    currentIndex,
    setCurrentIndex,
    items: concepts,
    isLoading,
    handleNext,
    handlePrevious,
    hasNext,
    hasPrevious
  } = useContentData({ contentType: 'concept' });

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
      console.log('[ConceptsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  // Handle URL-based navigation to detailed view
  useEffect(() => {
    if (location.pathname.includes('/view/concept/')) {
      const conceptId = location.pathname.split('/view/concept/')[1];
      
      if (selectedConcept?.id !== conceptId) {
        const concept = concepts.find(c => c.id === conceptId || c.slug === conceptId);
        
        if (concept) {
          console.log("Found matching concept in list:", concept.title);
          setSelectedConcept(concept);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    } else if (selectedConcept) {
      setSelectedConcept(null);
    }
  }, [location.pathname, concepts, selectedConcept, onDetailedViewShow]);

  const handleLearnMore = (concept: ContentItem) => {
    setSelectedConcept(concept);
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[ConceptsContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/concept/${concept.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedConcept(null);
    
    const sourcePath = getSourcePath();
    console.log("[ConceptsContent] Navigating back to:", sourcePath);
    
    navigate(sourcePath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  if (isLoading || !conceptToShow) {
    return (
      <div className="h-full">
        <ConceptLoadingSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        {conceptToShow && (
          <ContentCard
            image={conceptToShow.image || conceptToShow.illustration || ''}
            title={conceptToShow.title || ''}
            about={conceptToShow.about || ""}
            itemId={conceptToShow.id}
            itemType="concept"
            onLearnMore={() => handleLearnMore(conceptToShow)}
            onImageClick={() => handleLearnMore(conceptToShow)}
            onPrevious={hasPrevious ? handlePrevious : undefined}
            onNext={hasNext ? handleNext : undefined}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
        )}
      </div>

      {selectedConcept && (
        <DetailedView
          key={`concept-detail-${selectedConcept.id}`}
          type="concept"
          data={selectedConcept}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ConceptsContent;
