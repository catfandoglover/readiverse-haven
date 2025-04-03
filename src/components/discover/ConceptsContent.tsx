import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

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
  slug?: string;
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
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log("[ConceptsContent] Mobile detection:", isMobile);
  }, [isMobile]);

  const { data: concepts = [], isLoading } = useQuery({
    queryKey: ["concepts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("concepts")
        .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
        .limit(5);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load concepts",
        });
        console.error("Error fetching concepts:", error);
        return [];
      }

      // Sort the concepts by randomizer after fetching
      const sortedData = [...(data || [])].sort((a, b) => (a.randomizer || 0) - (b.randomizer || 0));

      return sortedData.map((concept: any) => ({
        ...concept,
        type: concept.concept_type || "concept",
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
    const loadConceptFromUrl = async () => {
      if (location.pathname.includes('/concepts/')) {
        const slug = location.pathname.split('/concepts/')[1];
        
        // First try to find the concept in our existing data
        let concept = concepts.find(c => c.slug === slug);
        
        // If not found in existing data, fetch it directly
        if (!concept) {
          const { data, error } = await supabase
            .from("concepts")
            .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
            .eq('slug', slug)
            .single();
            
          if (data && !error) {
            concept = {
              ...data,
              type: data.concept_type || "concept",
              about: data.about || `${data.title} is a significant philosophical concept.`,
              genealogy: `The historical development of ${data.title} spans multiple philosophical traditions.`,
              great_conversation: data.great_conversation || `${data.title} has been debated throughout philosophical history.`,
              image: data.illustration,
            };
          }
        }
        
        if (concept) {
          setSelectedConcept(concept);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    };
    
    loadConceptFromUrl();
  }, [location.pathname, concepts, onDetailedViewShow, supabase]);

  // Save the current path for proper back navigation - this is critical
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only save the source path if we're not in a detail view
    if (!currentPath.includes('/concepts/')) {
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
    
    // Get the current path before navigation
    const sourcePath = location.pathname;
    console.log("[ConceptsContent] Setting source path for detail view:", sourcePath);
    
    // Save the source path before navigation
    saveSourcePath(sourcePath);
    
    // Navigate to concept detail view
    const slug = concept.slug || concept.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || concept.id;
    navigate(`/concepts/${slug}`, { 
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
    
    if (sourcePath) {
      navigate(sourcePath);
    } else {
      navigate('/discover');
    }
    
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
