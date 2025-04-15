import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
import { useInView } from 'react-intersection-observer';

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

const PAGE_SIZE = 5;

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
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const [desktopIndex, setDesktopIndex] = useState(currentIndex);

  const { 
    data: forYouPages, 
    fetchNextPage, 
    hasNextPage, 
    isLoading, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ["for-you-content-paginated"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      console.log(`Fetching ForYou page: ${pageParam}, range: ${from}-${to}`);
      
      const minimalFields = {
        books: "id, title, author, icon_illustration, Cover_super, slug, about", 
        icons: "id, name, illustration, slug, about",
        concepts: "id, title, illustration, slug, about"
      };

      try {
        const [booksResponse, iconsResponse, conceptsResponse] = await Promise.all([
          supabase.from("books").select(minimalFields.books, { count: 'exact' }).order("randomizer").range(from, to),
          supabase.from("icons").select(minimalFields.icons, { count: 'exact' }).order("randomizer").range(from, to),
          supabase.from("concepts").select(minimalFields.concepts, { count: 'exact' }).order("randomizer").range(from, to)
        ]);

        if (booksResponse.error || iconsResponse.error || conceptsResponse.error) {
          console.error("Error fetching one or more ForYou sources:", {
             booksError: booksResponse.error,
             iconsError: iconsResponse.error,
             conceptsError: conceptsResponse.error 
            });
          if (!booksResponse.data && !iconsResponse.data && !conceptsResponse.data) {
             throw new Error("Failed to fetch any content for For You");
          }
        }
        
        const books = (booksResponse.data || []).map((book: any) => ({
            id: book.id,
            title: book.title,
            type: "classic" as const,
            image: book.icon_illustration || book.Cover_super || "",
            about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
            author: book.author,
            slug: book.slug || book.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || book.id,
        }));
        const icons = (iconsResponse.data || []).map((icon: any) => ({
            id: icon.id,
            title: icon.name,
            type: "icon" as const,
            image: icon.illustration,
            about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
            slug: icon.slug || icon.name?.toLowerCase().replace(/\s+/g, '-') || '',
        }));
        const concepts = (conceptsResponse.data || []).map((concept: any) => ({
            id: concept.id,
            title: concept.title,
            type: "concept" as const,
            image: concept.illustration,
            about: concept.about || `${concept.title} is a significant philosophical concept.`,
            slug: concept.slug || concept.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || concept.id,
        }));

        const combinedItems: ForYouContentItem[] = [...books, ...icons, ...concepts];
        
        const hasMoreData = (booksResponse?.data?.length ?? 0) > 0 || 
                            (iconsResponse?.data?.length ?? 0) > 0 || 
                            (conceptsResponse?.data?.length ?? 0) > 0;
                            
        const estimatedTotalCount = booksResponse.count ?? 0; 

        return { 
          data: combinedItems.sort(() => Math.random() - 0.5),
          hasMoreDataFromSources: hasMoreData,
          estimatedTotalCount
        };

      } catch (error) {
        console.error("Error fetching For You content page:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load personalized content" });
        return { data: [], hasMoreDataFromSources: false, estimatedTotalCount: 0 };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
       if (lastPage.hasMoreDataFromSources) {
         return lastPageParam + 1;
       }
       return undefined;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, 
  });

  const forYouItems = forYouPages?.pages.flatMap(page => page.data) ?? [];

  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNextPage) {
      console.log("Load more ForYou items triggered...");
      fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, fetchNextPage, isFetchingNextPage]);

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
      console.log(`[ForYouContent] Looking for ${itemType} with slug: ${slug}`);
      itemToSelect = forYouItems.find(item => item.type === itemType && item.slug === slug);
      if (itemToSelect) {
        console.log(`[ForYouContent] Found ${itemType} in loaded items:`, itemToSelect.title);
        if (!selectedItem || selectedItem.id !== itemToSelect.id) {
             setSelectedItem(itemToSelect);
             if (onDetailedViewShow) onDetailedViewShow();
        }
      } else {
        // Optional: Add logic here to fetch directly if needed, similar to other feeds
         console.log(`[ForYouContent] ${itemType} with slug ${slug} not found in loaded items.`);
      }
    } else if (selectedItem){
        // If URL doesn't contain a detail path, clear selected item
        // setSelectedItem(null); 
        // ^-- Commenting out for now, might cause issues with modal closing
    }
  }, [location.pathname, forYouItems, onDetailedViewShow, selectedItem]); // Depend on flattened 'forYouItems' and selectedItem

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
      // Use navigate for SPA behavior
      navigate(targetUrl, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else {
      console.error("Item missing slug or unknown type:", item);
      return; // Don't proceed if no valid URL
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
    if (!isMobile && desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  }, [isMobile, desktopIndex]);

  const handleNext = useCallback(() => {
    if (!isMobile) {
      if (desktopIndex < forYouItems.length - 1) {
        setDesktopIndex(prevIndex => prevIndex + 1);
      } else if (hasNextPage && !isFetchingNextPage) {
        console.log("Desktop Next (ForYou): Fetching next page...");
        fetchNextPage();
      }
    }
  }, [isMobile, desktopIndex, forYouItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getCurrentItem = () => forYouItems[desktopIndex] || null;

  if (isLoading && !forYouItems.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/60" />
        <p className="text-[#E9E7E2]/60">Loading recommendations...</p>
      </div>
    );
  }

  if (!isLoading && forYouItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <p className="text-[#E9E7E2]/80">Couldn't load recommendations at this time.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto" >
          {forYouItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="p-4 border-b border-gray-700 last:border-b-0">
              <ContentCard
                image={item.image}
                title={item.title}
                about={item.about}
                itemId={item.id}
                itemType={item.type}
                onLearnMore={() => handleLearnMore(item)}
                onImageClick={() => handleLearnMore(item)}
                hasPrevious={false} 
                hasNext={false}
              />
            </div>
          ))}
          
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
            {isFetchingNextPage ? (
              <p className="text-gray-400">Loading more...</p>
            ) : hasNextPage ? (
              <p className="text-gray-500">Scroll down to load more</p>
            ) : forYouItems.length > 0 ? (
              <p className="text-gray-600">End of list</p>
            ) : null } 
          </div>
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
  }

  const currentItem = getCurrentItem();
  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < forYouItems.length - 1 || (hasNextPage && !isFetchingNextPage);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {currentItem ? (
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
        ) : isLoading ? (
           <div className="animate-pulse text-gray-400">Loading...</div>
        ) : (
           <p className="text-gray-500">No recommendations found.</p>
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
