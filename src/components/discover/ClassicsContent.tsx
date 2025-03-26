import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useBookshelfManager } from "@/hooks/useBookshelfManager";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationState } from "@/hooks/useNavigationState";

interface ForYouContentItem {
  id: string;
  title: string;
  type: "classic" | "icon" | "concept";
  image: string;
  about: string;
  [key: string]: any;
}

interface ForYouContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ClassicsContent: React.FC<ForYouContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToBookshelf } = useBookshelfManager();
  const { user } = useAuth();
  useNavigationState();

  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  const { data: classicsItems = [], isLoading } = useQuery({
    queryKey: ["classics-content"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("randomizer");

        if (error) {
          console.error("Error fetching classics content:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classics content",
          });
          return [];
        }

        const classics: ForYouContentItem[] = data.map((book: any) => ({
          id: book.id,
          title: book.title,
          type: "classic" as const,
          image: book.icon_illustration || book.Cover_super || "",
          about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
          author: book.author,
          great_conversation: `${book.title} has played an important role in shaping intellectual discourse.`,
          Cover_super: book.Cover_super,
          epub_file_url: book.epub_file_url,
        }));

        return classics;
      } catch (error) {
        console.error("Error fetching classics content:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load classics content",
        });
        return [];
      }
    },
  });

  useEffect(() => {
    if (location.pathname.includes('/view/')) {
      const parts = location.pathname.split('/');
      const type = parts[2];
      const id = parts[3];
      
      if (type && id) {
        const item = classicsItems.find(item => item.id === id && item.type === type);
        if (item) {
          setSelectedItem(item);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    }
  }, [location.pathname, classicsItems, onDetailedViewShow]);

  const handlePrevious = () => {
    if (displayIndex > 0) {
      setDisplayIndex(displayIndex - 1);
    }
  };

  const handleNext = () => {
    if (classicsItems.length > 0 && displayIndex < classicsItems.length - 1) {
      setDisplayIndex(displayIndex + 1);
    }
  };

  const itemToShow = classicsItems[displayIndex % Math.max(1, classicsItems.length)] || null;

  const handleLearnMore = (item: ForYouContentItem) => {
    setSelectedItem(item);
    navigate(`/view/${item.type}/${item.id}`, { 
      replace: true,
      state: { fromSection: 'discover' }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    const previousPath = getPreviousPage();
    console.log("Navigating back to previous page:", previousPath);
    navigate(previousPath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is consciousness?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'How do we know what we know?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is the nature of reality?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_classics: [
      { id: '1', title: 'The Republic', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Meditations', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Critique of Pure Reason', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_icons: [
      { id: '1', title: 'Plato', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '2', title: 'Marcus Aurelius', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '3', title: 'Immanuel Kant', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Epistemology', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Metaphysics', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'Ethics', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
  };

  if (isLoading || !itemToShow) {
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

  return (
    <>
      <div className="h-full">
        <ContentCard
          image={itemToShow.image}
          title={itemToShow.title}
          about={itemToShow.about}
          itemId={itemToShow.id}
          itemType={itemToShow.type}
          onLearnMore={() => handleLearnMore(itemToShow)}
          onImageClick={() => handleLearnMore(itemToShow)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={displayIndex > 0}
          hasNext={displayIndex < classicsItems.length - 1}
        />
      </div>

      {selectedItem && (
        <DetailedView
          type={selectedItem.type}
          data={{
            ...selectedItem,
            ...mockRelatedData
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ClassicsContent;
