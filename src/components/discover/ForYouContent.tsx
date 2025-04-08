import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useBookshelfManager } from "@/hooks/useBookshelfManager";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigationState } from "@/hooks/useNavigationState";
import VerticalSwiper, { VerticalSwiperHandle } from "@/components/common/VerticalSwiper";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

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

const ForYouContent: React.FC<ForYouContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToBookshelf } = useBookshelfManager();
  const { user } = useAuth();
  const { saveSourcePath, getSourcePath } = useNavigationState();
  const swiperRef = useRef<VerticalSwiperHandle>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
    toast({
      title: "Retrying",
      description: "Attempting to reload content...",
    });
  };

  const { data: forYouItems = [], isLoading, isError } = useQuery({
    queryKey: ["for-you-content", retryAttempt],
    queryFn: async () => {
      try {
        // Fetch minimal fields initially to improve load time
        // Only fetch essential display fields
        const minimalFields = {
          books: "id, title, author, icon_illustration, Cover_super, slug, about", 
          icons: "id, name, illustration, slug, about",
          concepts: "id, title, illustration, slug, about"
        };
        
        let books = [];
        let icons = [];
        let concepts = [];
        
        try {
          const booksResponse = await supabase
            .from("books")
            .select(minimalFields.books)
            .order("randomizer")
            .limit(5);
          
          if (booksResponse.error) {
            console.error("Error fetching books:", booksResponse.error);
          } else {
            books = booksResponse.data || [];
          }
        } catch (booksError) {
          console.error("Exception fetching books:", booksError);
        }
        
        try {
          const iconsResponse = await supabase
            .from("icons")
            .select(minimalFields.icons)
            .order("randomizer")
            .limit(5);
          
          if (iconsResponse.error) {
            console.error("Error fetching icons:", iconsResponse.error);
          } else {
            icons = iconsResponse.data || [];
          }
        } catch (iconsError) {
          console.error("Exception fetching icons:", iconsError);
        }
        
        try {
          const conceptsResponse = await supabase
            .from("concepts")
            .select(minimalFields.concepts)
            .limit(5);
          
          if (conceptsResponse.error) {
            console.error("Error fetching concepts:", conceptsResponse.error);
          } else {
            concepts = conceptsResponse.data || [];
          }
        } catch (conceptsError) {
          console.error("Exception fetching concepts:", conceptsError);
        }
        
        if (books.length === 0 && icons.length === 0 && concepts.length === 0) {
          throw new Error("Failed to fetch any content");
        }

        const forYouItems: ForYouContentItem[] = [
          ...books.map((book: any) => ({
            id: book.id,
            title: book.title,
            type: "classic" as const,
            image: book.icon_illustration || book.Cover_super || "",
            about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
            author: book.author,
            slug: book.slug || book.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || book.id,
            // Other fields can be loaded on demand when user selects the item
          })),
          ...icons.map((icon: any) => ({
            id: icon.id,
            title: icon.name,
            type: "icon" as const,
            image: icon.illustration,
            about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
            slug: icon.slug || icon.name?.toLowerCase().replace(/\s+/g, '-') || '',
            // Other fields can be loaded on demand when user selects the item
          })),
          ...concepts.map((concept: any) => ({
            id: concept.id,
            title: concept.title,
            type: "concept" as const,
            image: concept.illustration,
            about: concept.about || `${concept.title} is a significant philosophical concept.`,
            slug: concept.slug || concept.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || concept.id,
            // Other fields can be loaded on demand when user selects the item
          })),
        ];

        return forYouItems.sort(() => Math.random() - 0.5).slice(0, 10); // Simplify sort for speed and limit to 10
      } catch (error) {
        console.error("Error fetching For You content:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load personalized content",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 15000),
    // Add caching to prevent frequent refetching
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes (was previously called cacheTime)
  });

  useEffect(() => {
    if (location.pathname.includes('/icons/')) {
      const slug = location.pathname.split('/icons/')[1];
      const item = forYouItems.find(item => item.type === 'icon' && item.slug === slug);
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    } else if (location.pathname.includes('/texts/')) {
      const slug = location.pathname.split('/texts/')[1];
      const item = forYouItems.find(item => item.type === 'classic' && item.slug === slug);
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    } else if (location.pathname.includes('/concepts/')) {
      const slug = location.pathname.split('/concepts/')[1];
      const item = forYouItems.find(item => item.type === 'concept' && item.slug === slug);
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    }
  }, [location.pathname, forYouItems, onDetailedViewShow]);

  const handlePrevious = () => {
    console.log("Previous button clicked, index:", displayIndex);
    if (swiperRef.current) {
      swiperRef.current.goPrevious();
    } else if (displayIndex > 0) {
      setDisplayIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNext = () => {
    console.log("Next button clicked, index:", displayIndex);
    if (swiperRef.current) {
      swiperRef.current.goNext();
    } else if (forYouItems.length > 0 && displayIndex < forYouItems.length - 1) {
      setDisplayIndex(prevIndex => prevIndex + 1);
    }
  };

  // Define getCurrentItem function to avoid duplicate code
  const getCurrentItem = () => forYouItems[displayIndex % Math.max(1, forYouItems.length)] || null;

  const handleLearnMore = (item: ForYouContentItem) => {
    // Save the current path before navigation
    const currentPath = location.pathname;
    console.log("[ForYouContent] Setting source path for detail view:", currentPath);
    
    // Save the source path before navigation
    saveSourcePath(currentPath);
    
    setSelectedItem(item);
    
    if (item.type === 'icon' && item.slug) {
      navigate(`/icons/${item.slug}`, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else if (item.type === 'classic' && item.slug) {
      navigate(`/texts/${item.slug}`, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else if (item.type === 'concept' && item.slug) {
      navigate(`/concepts/${item.slug}`, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else {
      console.error("Item missing slug:", item);
    }
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    const previousPath = getPreviousPage();
    console.log("[ForYouContent] Navigating back to previous page:", previousPath);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <div className="text-gray-400">Loading your personalized recommendations...</div>
      </div>
    );
  }

  if (isError || !forYouItems || forYouItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <div className="text-red-500 text-lg font-semibold">Content could not be loaded</div>
        <p className="text-gray-600 mb-4">
          We're having trouble loading your personalized content. Please try again.
        </p>
        <Button 
          onClick={handleRetry} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Content
        </Button>
      </div>
    );
  }

  // Conditionally render based on mobile vs desktop
  if (isMobile) {
    return (
      <>
        <VerticalSwiper 
          ref={swiperRef}
          initialIndex={displayIndex}
          onIndexChange={setDisplayIndex}
        >
          {forYouItems.map((item, index) => (
            <div key={item.id} className="h-full">
              <ContentCard
                image={item.image}
                title={item.title}
                about={item.about}
                itemId={item.id}
                itemType={item.type}
                onLearnMore={() => handleLearnMore(item)}
                onImageClick={() => handleLearnMore(item)}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={index > 0}
                hasNext={index < forYouItems.length - 1}
              />
            </div>
          ))}
        </VerticalSwiper>
  
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
  }

  // Desktop view - use getCurrentItem instead of redefining itemToShow
  const currentItem = getCurrentItem();
  
  return (
    <>
      <div className="h-full">
        {currentItem && (
          <ContentCard
            image={currentItem.image}
            title={currentItem.title}
            about={currentItem.about}
            itemId={currentItem.id}
            itemType={currentItem.type}
            onLearnMore={() => handleLearnMore(currentItem)}
            onImageClick={() => handleLearnMore(currentItem)}
            onPrevious={displayIndex > 0 ? handlePrevious : undefined}
            onNext={displayIndex < forYouItems.length - 1 ? handleNext : undefined}
            hasPrevious={displayIndex > 0}
            hasNext={displayIndex < forYouItems.length - 1}
          />
        )}
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

export default ForYouContent;
