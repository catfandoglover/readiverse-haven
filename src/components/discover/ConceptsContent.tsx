
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";

interface Concept {
  id: string;
  title: string;
  illustration: string;
  description?: string;
  about?: string;
  genealogy?: string;
  great_conversation?: string;
  category?: string;
  type?: string;
  randomizer?: number;
  created_at?: string;
  introduction?: string;
}

interface ConceptsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ConceptsContent: React.FC<ConceptsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [conceptIndex, setConceptIndex] = useState(currentIndex);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  const { data: concepts = [], isLoading } = useQuery({
    queryKey: ["concepts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .order("randomizer");
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load concepts",
        });
        return [];
      }

      return data.map((concept: any) => ({
        ...concept,
        type: "concept",
        about: concept.about || concept.description || `${concept.title} is a significant philosophical concept.`,
        genealogy: concept.genealogy || `The historical development of ${concept.title} spans multiple philosophical traditions.`,
        great_conversation: concept.great_conversation || `${concept.title} has been debated throughout philosophical history.`,
        image: concept.illustration,
      }));
    },
  });

  // Update conceptIndex when props change
  useEffect(() => {
    setConceptIndex(currentIndex);
  }, [currentIndex]);

  // Handle URL-based navigation and detailed view visibility
  useEffect(() => {
    if (location.pathname.includes('/view/concept/')) {
      const conceptId = location.pathname.split('/view/concept/')[1];
      const concept = concepts.find(c => c.id === conceptId);
      
      if (concept) {
        setSelectedConcept(concept);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    }
  }, [location.pathname, concepts, onDetailedViewShow]);

  // Save the current path for proper back navigation - this is critical
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/view/')) {
      // This will store the current feed page as the source path
      saveSourcePath(currentPath);
      console.log('[ConceptsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const handleNextConcept = () => {
    if (concepts.length === 0) return;
    const newIndex = (conceptIndex + 1) % concepts.length;
    setConceptIndex(newIndex);
  };

  const handlePrevConcept = () => {
    if (concepts.length === 0) return;
    const newIndex = (conceptIndex - 1 + concepts.length) % concepts.length;
    setConceptIndex(newIndex);
  };

  const handleLearnMore = (concept: Concept) => {
    setSelectedConcept(concept);
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[ConceptsContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/concept/${concept.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath // Pass the exact current path
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

  if (isLoading || concepts.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  const currentConcept = concepts[conceptIndex % concepts.length];

  return (
    <>
      <div className="h-full">
        <ContentCard
          image={currentConcept.illustration}
          title={currentConcept.title}
          about={currentConcept.about || ""}
          itemId={currentConcept.id}
          itemType="concept"
          onLearnMore={() => handleLearnMore(currentConcept)}
          onImageClick={() => handleLearnMore(currentConcept)}
          onPrevious={handlePrevConcept}
          onNext={handleNextConcept}
          hasPrevious={concepts.length > 1}
          hasNext={concepts.length > 1}
        />
      </div>

      {selectedConcept && (
        <DetailedView
          type="concept"
          data={{
            ...selectedConcept,
            image: selectedConcept.illustration
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ConceptsContent;
