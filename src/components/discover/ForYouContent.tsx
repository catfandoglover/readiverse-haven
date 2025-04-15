import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/integrations/supabase/client";
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
import { Loader2 } from "lucide-react";

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

interface ShuffledItem {
  id: string;
  type: "classic" | "icon" | "concept";
}

// Shuffle function
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;
  const newArray = [...array]; // Create a copy
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
}

const ForYouContent: React.FC<ForYouContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToBookshelf } = useBookshelfManager();
  const { user } = useAuth();
  const { saveSourcePath, getSourcePath } = useNavigationState();
  const swiperRef = useRef<VerticalSwiperHandle>(null);
  const isMobile = useIsMobile();
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [shuffledItems, setShuffledItems] = useState<ShuffledItem[]>([]);
  const queryClient = useQueryClient();

  const { data: allItemIds, isLoading: isLoadingIds } = useQuery({
    queryKey: ["for-you-all-ids"],
    queryFn: async () => {
      console.log("Fetching all IDs for For You...");
      try {
        const [booksRes, iconsRes, conceptsRes] = await Promise.all([
          supabaseClient.from("books").select("id"),
          supabaseClient.from("icons").select("id"),
          supabaseClient.from("concepts").select("id")
        ]);

        if (booksRes.error) console.error("Error fetching book IDs:", booksRes.error);
        if (iconsRes.error) console.error("Error fetching icon IDs:", iconsRes.error);
        if (conceptsRes.error) console.error("Error fetching concept IDs:", conceptsRes.error);

        const combined = [
          ...(booksRes.data || []).map(item => ({ id: item.id, type: 'classic' as const })),
          ...(iconsRes.data || []).map(item => ({ id: item.id, type: 'icon' as const })),
          ...(conceptsRes.data || []).map(item => ({ id: item.id, type: 'concept' as const }))
        ];
        console.log(`Fetched ${combined.length} total IDs for For You.`);
        return combined;
      } catch (error) {
        console.error("Error fetching combined IDs for For You:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load content IDs" });
        return [];
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (allItemIds && allItemIds.length > 0) {
      console.log("[ShuffleEffect ForYou] Shuffling combined items...");
      setShuffledItems(shuffleArray(allItemIds));
      setDesktopIndex(0);
    }
  }, [allItemIds]);

  const currentItemRef = useMemo(() => {
    if (shuffledItems.length > 0 && desktopIndex >= 0 && desktopIndex < shuffledItems.length) {
      return shuffledItems[desktopIndex];
    }
    return null;
  }, [shuffledItems, desktopIndex]);
  const currentItemId = currentItemRef?.id;
  const currentItemType = currentItemRef?.type;

  const fetchItemDetails = useCallback(async (itemId: string | null | undefined, itemType: ShuffledItem['type'] | null | undefined) => {
    if (!itemId || !itemType) return null;
    
    let tableName: string;
    let selectFields: string;
    
    switch (itemType) {
      case 'classic': 
        tableName = 'books';
        selectFields = 'id, title, author, icon_illustration, Cover_super, slug, about, epub_file_url';
        break;
      case 'icon': 
        tableName = 'icons'; 
        selectFields = 'id, name, illustration, about, slug, great_conversation, anecdotes';
        break;
      case 'concept': 
        tableName = 'concepts';
        selectFields = 'id, title, illustration, about, concept_type, introduction, slug, great_conversation';
        break;
      default: 
        console.error("Unknown item type for fetching details:", itemType);
        return null;
    }

    console.log(`Fetching details for ${itemType} ID: ${itemId}`);
    try {
      const { data, error } = await supabaseClient
        .from(tableName)
        .select(selectFields)
        .eq("id", itemId)
        .single();

      if (error) {
        console.error(`Error fetching details for ${itemType} ${itemId}:`, error);
        toast({ variant: "destructive", title: "Error", description: `Failed to load ${itemType} details` });
        return null;
      }
      
      const generateSlug = (title: string): string => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (itemType === 'classic') {
        return {
          ...data,
          type: "classic" as const,
          image: data.icon_illustration || data.Cover_super || "",
          about: data.about || `A classic work by ${data.author || 'Unknown Author'}.`,
          slug: data.slug || (data.title ? generateSlug(data.title) : data.id),
        };
      } else if (itemType === 'icon') {
        return {
          ...data,
          title: data.name,
          type: "icon" as const,
          image: data.illustration,
          about: data.about || `${data.name} was a significant figure in philosophical history.`,
          slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || '',
        };
      } else if (itemType === 'concept') {
        return {
          ...data,
          type: data.concept_type || "concept",
          image: data.illustration,
          about: data.about || data.description || `${data.title} is a significant philosophical concept.`,
          great_conversation: data.great_conversation || `${data.title} has been debated throughout philosophical history.`,
          slug: data.slug || (data.title ? generateSlug(data.title) : data.id),
        };
      }
      return null;

    } catch(error) {
      console.error(`Exception fetching details for ${itemType} ${itemId}:`, error);
      return null;
    }
  }, [supabaseClient, toast]);

  const { 
    data: currentItemData, 
    isLoading: isLoadingCurrentItem, 
    isError: isCurrentItemError 
  } = useQuery({
    queryKey: ["item-details", currentItemId, currentItemType], 
    queryFn: () => fetchItemDetails(currentItemId, currentItemType),
    enabled: !!currentItemId && !!currentItemType,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    let itemToSelect: ForYouContentItem | null | undefined = null;
    let slug: string | undefined = undefined;
    let itemType: ForYouContentItem['type'] | undefined = undefined;

    if (location.pathname.includes('/icons/')) {
      slug = location.pathname.split('/icons/')[1];
      itemType = 'icon';
    } else if (location.pathname.includes('/texts/')) {
      slug = location.pathname.split('/texts/')[1];
      itemType = 'classic';
    } else if (location.pathname.includes('/concepts/')) {
      slug = location.pathname.split('/concepts/')[1];
      itemType = 'concept';
    }

    if (slug && itemType) {
      if (currentItemData && currentItemData.slug === slug && currentItemData.type === itemType) {
        if (!selectedItem || selectedItem.id !== currentItemData.id) {
          console.log(`[ForYouContent] Setting selected item from current data: ${currentItemData.title}`);
          setSelectedItem(currentItemData as ForYouContentItem);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      } else {
        console.log(`[ForYouContent] ${itemType} slug ${slug} doesn't match current item or no current item data. Consider direct fetch.`);
      }
    } else if (selectedItem){
    }
  }, [location.pathname, currentItemData, onDetailedViewShow, selectedItem]);

  const handleLearnMore = (item: ForYouContentItem) => {
    const currentPath = location.pathname;
    console.log("[ForYouContent] Setting source path for detail view:", currentPath);
    
    saveSourcePath(currentPath);
    
    setSelectedItem(item);
    
    let targetUrl: string | null = null;
    if (item.type === 'icon' && item.slug) {
      targetUrl = `/icons/${item.slug}`;
    } else if (item.type === 'classic' && item.slug) {
      targetUrl = `/texts/${item.slug}`;
    } else if (item.type === 'concept' && item.slug) {
      targetUrl = `/concepts/${item.slug}`;
    }
    
    if (targetUrl) {
      navigate(targetUrl, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else {
      console.error("Item missing slug or unknown type:", item);
      return;
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

  const handlePrevious = useCallback(() => {
    if (desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  }, [desktopIndex]);

  const handleNext = useCallback(() => {
    if (desktopIndex < shuffledItems.length - 1) {
      setDesktopIndex(prevIndex => prevIndex + 1);
    }
  }, [desktopIndex, shuffledItems.length]);

  const getCurrentItem = () => currentItemData;

  const isLoadingCombined = isLoadingIds || (!!currentItemId && isLoadingCurrentItem);
  const currentItem = getCurrentItem();

  if (isLoadingCombined && !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/60" />
        <p className="text-[#E9E7E2]/60">Loading recommendations...</p>
      </div>
    );
  }

  if (!isLoadingIds && shuffledItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <p className="text-[#E9E7E2]/80">Couldn't load recommendations at this time.</p>
      </div>
    );
  }

  if (isMobile) {
    // Use VerticalSwiper for mobile view - TikTok-style swiping
    return (
      <div className="h-full flex flex-col">
        {!selectedItem && shuffledItems.length > 0 && currentItem ? (
          <VerticalSwiper 
            initialIndex={desktopIndex}
            onIndexChange={(index) => setDesktopIndex(index)}
          >
            {shuffledItems.map((item, index) => {
              const isCurrentIndex = index === desktopIndex;
              return (
                <div key={`${item.type}-${item.id}`} className="h-full flex items-center justify-center">
                  {isCurrentIndex && currentItem ? (
                    <ContentCard
                      image={currentItem.image}
                      title={currentItem.title}
                      about={currentItem.about}
                      itemId={currentItem.id}
                      itemType={currentItem.type}
                      onLearnMore={() => handleLearnMore(currentItem)}
                      onImageClick={() => handleLearnMore(currentItem)}
                      hasPrevious={index > 0}
                      hasNext={index < shuffledItems.length - 1}
                      swiperMode={true}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-[#E9E7E2]/60">Loading item...</p>
                      <div className="animate-pulse mt-4 h-64 w-full bg-[#3F3A46]/30 rounded-lg"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </VerticalSwiper>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#E9E7E2]/60">Loading recommendations...</p>
              <div className="animate-pulse mt-4 h-64 w-full bg-[#3F3A46]/30 rounded-lg"></div>
            </div>
          </div>
        )}
        
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
      </div>
    );
  }

  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < shuffledItems.length - 1;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-[#2A282A]">
        {(isLoadingCurrentItem && !currentItem) ? (
          <div className="animate-pulse text-[#E9E7E2]/60">Loading Item...</div>
        ) : currentItem ? (
          <ContentCard
            image={currentItem.image}
            title={currentItem.title}
            about={currentItem.about}
            itemId={currentItem.id}
            itemType={currentItem.type}
            onLearnMore={() => handleLearnMore(currentItem)}
            onImageClick={() => handleLearnMore(currentItem)}
            onPrevious={hasPreviousDesktop ? handlePrevious : undefined}
            onNext={hasNextDesktop ? handleNext : undefined}
            hasPrevious={hasPreviousDesktop}
            hasNext={hasNextDesktop}
          />
        ) : isCurrentItemError ? (
          <p className="text-red-500">Error loading this item.</p>
        ) : (
          <p className="text-[#E9E7E2]/80">No recommendations found.</p>
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
    </div>
  );
};

export default ForYouContent;
