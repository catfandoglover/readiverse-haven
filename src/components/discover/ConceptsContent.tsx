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
        // Extract the entire path after /concepts/
        let fullPath = location.pathname.split('/concepts/')[1];
        
        // Remove any trailing slashes
        fullPath = fullPath.replace(/\/$/, '');
        
        console.log("[ConceptsContent] Full path:", fullPath);
        
        // Extract the last segment (the actual concept name)
        const segments = fullPath.split('/');
        const lastSegment = segments[segments.length - 1];
        
        console.log("[ConceptsContent] Last segment:", lastSegment);
        
        // First try to find the concept in the cached data
        let concept = concepts.find(c => 
          c.slug === fullPath || 
          c.slug === lastSegment || 
          c.title?.toLowerCase() === lastSegment.toLowerCase()
        );
        
        // If not found in memory, query the database
        if (!concept) {
          console.log("[ConceptsContent] Concept not found in memory, querying database");
          
          // Try several strategies to find the concept
          
          // 1. Try exact match with full path
          let { data: exactMatchData, error: exactMatchError } = await supabase
            .from("concepts")
            .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
            .eq('slug', fullPath)
            .limit(1);
          
          // 2. If not found, try with the last segment
          if (!exactMatchData || exactMatchData.length === 0) {
            console.log("[ConceptsContent] Trying with last segment:", lastSegment);
            
            const { data: lastSegmentData, error: lastSegmentError } = await supabase
              .from("concepts")
              .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
              .or(`slug.eq.${lastSegment},title.ilike.%${lastSegment}%`)
              .limit(1);
            
            if (lastSegmentData && lastSegmentData.length > 0) {
              exactMatchData = lastSegmentData;
            }
          }
          
          // 3. If still not found, use a more fuzzy match on title
          if (!exactMatchData || exactMatchData.length === 0) {
            console.log("[ConceptsContent] Trying fuzzy match on title:", lastSegment);
            
            const { data: fuzzyMatchData, error: fuzzyMatchError } = await supabase
              .from("concepts")
              .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
              .ilike('title', `%${lastSegment}%`)
              .limit(1);
            
            if (fuzzyMatchData && fuzzyMatchData.length > 0) {
              exactMatchData = fuzzyMatchData;
            }
          }
          
          // If we found data with any of our strategies, create a concept object
          if (exactMatchData && exactMatchData.length > 0) {
            concept = {
              ...exactMatchData[0],
              type: exactMatchData[0].concept_type || "concept",
              about: exactMatchData[0].about || `${exactMatchData[0].title} is a significant philosophical concept.`,
              genealogy: `The historical development of ${exactMatchData[0].title} spans multiple philosophical traditions.`,
              great_conversation: exactMatchData[0].great_conversation || `${exactMatchData[0].title} has been debated throughout philosophical history.`,
              image: exactMatchData[0].illustration,
            };
          }
        }
        
        if (concept) {
          console.log("[ConceptsContent] Found concept:", concept);
          setSelectedConcept(concept);
          if (onDetailedViewShow) onDetailedViewShow();
        } else {
          console.error("[ConceptsContent] Failed to find concept for path:", fullPath);
          toast({
            variant: "destructive",
            title: "Concept Not Found",
            description: "We couldn't find the concept you're looking for. Please try again.",
          });
        }
      }
    };
    
    loadConceptFromUrl();
  }, [location.pathname, concepts, onDetailedViewShow, supabase, toast]);

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
    // Use concept.slug if available, otherwise generate from title or id
    let slug = concept.slug;
    
    // If the slug contains slashes (complex path), use it directly
    if (!slug || !slug.includes('/')) {
      // For simple slugs, ensure we generate a clean version if needed
      slug = concept.slug || concept.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || concept.id;
    }
    
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
