
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useNavigationState } from "@/hooks/useNavigationState";

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

  const { getLastContentPath } = useNavigationState();

  useNavigationState();

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

      if (data && data.length > 0) {
        console.log("First concept data:", data[0]);
        console.log(`Loaded ${data.length} concepts total`);
      }

      return data.map((concept: any) => ({
        ...concept,
        about: concept.about || concept.description || `${concept.title} is a significant philosophical concept.`,
        genealogy: concept.genealogy || `The historical development of ${concept.title} spans multiple philosophical traditions.`,
        great_conversation: concept.great_conversation || `${concept.title} has been debated throughout philosophical history.`,
      }));
    },
  });

  useEffect(() => {
    // Update conceptIndex when props change
    setConceptIndex(currentIndex);
  }, [currentIndex]);

  // Handle URL-based navigation
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
    navigate(`/view/concept/${concept.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: getLastContentPath()
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedConcept(null);
    const previousPath = getPreviousPage();
    console.log("Navigating back to previous page:", previousPath);
    navigate(previousPath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  // Get the current concept to display
  const conceptToShow = concepts.length > 0 
    ? concepts[conceptIndex % concepts.length]
    : null;

  // Add swipe event handlers
  const handleTouchStart = React.useRef<number | null>(null);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (handleTouchStart.current === null) {
      handleTouchStart.current = e.touches[0].clientX;
      return;
    }
    
    const diff = handleTouchStart.current - e.touches[0].clientX;
    
    // Check if swipe is significant
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go to next
        handleNextConcept();
      } else {
        // Swipe right, go to previous
        handlePrevConcept();
      }
      handleTouchStart.current = null;
    }
  };
  
  const handleTouchEnd = () => {
    handleTouchStart.current = null;
  };

  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is virtue?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'How do we live virtuously?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is the good life?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
      { id: '4', title: 'How do virtues relate to happiness?', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
    related_classics: [
      { id: '1', title: 'Nicomachean Ethics', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'The Republic', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Ethics', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_icons: [
      { id: '1', title: 'Aristotle', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Plato', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'Confucius', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Eudaimonia', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Justice', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'The Golden Mean', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
  };

  if (isLoading || !conceptToShow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="h-full"
        onTouchStart={() => handleTouchStart.current = null}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
          <button 
            onClick={handlePrevConcept}
            className="h-10 w-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center text-[#E9E7E2]"
            aria-label="Previous concept"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <ContentCard
          image={conceptToShow.illustration}
          title={conceptToShow.title}
          about={conceptToShow.about || ""}
          onLearnMore={() => handleLearnMore(conceptToShow)}
          onImageClick={() => handleLearnMore(conceptToShow)}
        />
        
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
          <button 
            onClick={handleNextConcept}
            className="h-10 w-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center text-[#E9E7E2]"
            aria-label="Next concept"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="flex space-x-1">
            {concepts.slice(0, Math.min(concepts.length, 5)).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${
                  i === conceptIndex % Math.min(concepts.length, 5) ? 'bg-[#E9E7E2]' : 'bg-[#E9E7E2]/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedConcept && (
        <DetailedView
          type="concept"
          data={{
            ...selectedConcept,
            image: selectedConcept.illustration,
            ...mockRelatedData
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ConceptsContent;
