import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useIsMobile } from "@/hooks/use-mobile";
import VerticalSwiper from "../common/VerticalSwiper";
import { VerticalSwiperHandle } from "@/components/common/VerticalSwiper";

interface Icon {
  id: string;
  name: string;
  illustration: string;
  category?: string;
  about?: string;
  great_conversation?: string;
  anecdotes?: string | string[];
  randomizer?: number;
  created_at?: string;
  introduction?: string;
  slug?: string;
  Notion_URL?: string;
}

interface IconsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

// Shuffle function (can be moved to a utility file)
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

const IconLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="rounded-lg bg-gray-200 h-64 w-full"></div>
    <div className="h-8 bg-gray-200 rounded w-2/3"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
  </div>
);

const IconsContent: React.FC<IconsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { saveSourcePath, getSourcePath } = useNavigationState();
  const isMobile = useIsMobile();
  const swiperRef = useRef<VerticalSwiperHandle>(null);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!location.pathname.includes('/view/')) {
      saveSourcePath(location.pathname);
      console.log('[IconsContent] Saved source path:', location.pathname);
    }
  }, [location.pathname, saveSourcePath]);

  // Query 1: Fetch all Icon IDs
  const { data: allIconIds, isLoading: isLoadingIds } = useQuery({
    queryKey: ["all-icons-ids"],
    queryFn: async () => {
      console.log("Fetching all icon IDs...");
      const { data, error } = await supabaseClient
        .from("icons")
        .select("id");
      if (error) {
        console.error("Error fetching icon IDs:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load icon IDs" });
        return [];
      }
      return data.map(item => item.id);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Effect to shuffle IDs once fetched
  useEffect(() => {
    if (allIconIds && allIconIds.length > 0) {
      console.log("[ShuffleEffect Icons] Shuffling IDs...");
      setShuffledIds(shuffleArray(allIconIds));
      setDesktopIndex(0); // Reset index
    }
  }, [allIconIds]);

  // Determine the current ID
  const currentIconId = useMemo(() => {
      if (shuffledIds.length > 0 && desktopIndex >= 0 && desktopIndex < shuffledIds.length) {
          return shuffledIds[desktopIndex];
      }
      return null;
  }, [shuffledIds, desktopIndex]);

  // Define the query function separately for reuse
  const fetchIconDetails = async (iconId: string | null) => {
    if (!iconId) return null;
    console.log(`Fetching details for icon ID: ${iconId}`);
    const { data, error } = await supabaseClient
      .from("icons")
      .select("*" ) 
      .eq("id", iconId)
      .single(); 

    if (error) {
      console.error(`Error fetching details for icon ${iconId}:`, error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load icon details" });
      return null;
    }
    
    return {
      ...data,
      type: "icon" as const,
      slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || '',
      about: data.about || `${data.name} was a significant figure in philosophical history.`,
      // ... process other fields ...
    };
  };

  const fetchIconDirectly = async (iconSlug: string) => {
    try {
      console.log("[IconsContent] Directly fetching icon with slug:", iconSlug);
      
      const { data, error } = await supabaseClient
        .from("icons")
        .select("*")
        .eq('slug', iconSlug)
        .single();
      
      if (error) {
        console.error("[IconsContent] Error fetching icon directly:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find the requested icon"
        });
        return;
      }
      
      if (data) {
        console.log("[IconsContent] Directly fetched icon:", data.name);
        const processedIcon: Icon = {
          ...data,
          about: data.about || `${data.name} was a significant figure in philosophical history.`,
          great_conversation: data.great_conversation || `${data.name}'s contributions to philosophical discourse were substantial and continue to influence modern thought.`,
          anecdotes: data.anecdotes || `Various interesting stories surround ${data.name}'s life and work.`,
        };
        
        setSelectedIcon(processedIcon);
        if (onDetailedViewShow) onDetailedViewShow();
      } else {
        console.error("[IconsContent] No data returned for icon slug:", iconSlug);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load the requested icon"
        });
      }
    } catch (e) {
      console.error("[IconsContent] Unexpected error in fetchIconDirectly:", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while loading the icon"
      });
    }
  };

  useEffect(() => {
    const prefetchCount = 3;
    if (shuffledIds.length > 0) {
      for (let i = 1; i <= prefetchCount; i++) {
        const prefetchIndex = desktopIndex + i;
        if (prefetchIndex < shuffledIds.length) {
          const prefetchId = shuffledIds[prefetchIndex];
          console.log(`[Prefetch Icons] Prefetching ID: ${prefetchId}`);
          queryClient.prefetchQuery({
            queryKey: ['icon-details', prefetchId],
            queryFn: () => fetchIconDetails(prefetchId),
            staleTime: 5 * 60 * 1000
          });
        }
      }
    }
  }, [desktopIndex, shuffledIds, queryClient, fetchIconDetails]);

  // Query 2: Fetch details for the current Icon ID
  const { 
    data: currentItemData, 
    isLoading: isLoadingCurrentItem, 
    isError: isCurrentItemError 
  } = useQuery({
    queryKey: ["icon-details", currentIconId],
    queryFn: () => fetchIconDetails(currentIconId),
    enabled: !!currentIconId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Detail view logic for direct URL navigation
  useEffect(() => {
    if (location.pathname.includes('/icons/')) {
      const iconParam = location.pathname.split('/icons/')[1];
      
      // If we have the current icon data and it matches the URL, use it
      if (currentItemData && currentItemData.slug === iconParam && !selectedIcon) {
         console.log("[IconsContent] Setting selected item from current data");
         setSelectedIcon(currentItemData);
         if (onDetailedViewShow) onDetailedViewShow();
      } 
      // Otherwise, always fetch directly for URL-based navigation
      else if (!selectedIcon) {
         console.log("[IconsContent] Fetching icon directly from URL parameter:", iconParam);
         fetchIconDirectly(iconParam); 
      }
    } else if (selectedIcon) {
      setSelectedIcon(null);
    }
  }, [location.pathname, currentItemData, onDetailedViewShow, selectedIcon, fetchIconDirectly]);

  const handlePrevious = useCallback(() => {
    if (desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  }, [desktopIndex]);

  const handleNext = useCallback(() => {
    if (desktopIndex < shuffledIds.length - 1) {
      setDesktopIndex(prevIndex => prevIndex + 1);
    }
    // No fetching needed here
  }, [desktopIndex, shuffledIds.length]);

  const handleLearnMore = (icon: Icon) => {
    if (!icon.slug) {
      console.error("Icon missing slug:", icon);
      return;
    }
    
    const currentPath = location.pathname;
    console.log("[IconsContent] Setting source path for detail view:", currentPath);
    saveSourcePath(currentPath);
    
    setSelectedIcon(icon);
    
    navigate(`/icons/${icon.slug}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: currentPath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedIcon(null);
    
    const sourcePaths = {
      localStorage: localStorage.getItem('sourcePath'),
      sessionStorage: sessionStorage.getItem('sourcePath'),
      localDetailedView: localStorage.getItem('detailedViewSourcePath'),
      sessionDetailedView: sessionStorage.getItem('detailedViewSourcePath')
    };
    
    console.log("[IconsContent] Available source paths for back navigation:", sourcePaths);
    
    if (sourcePaths.localDetailedView && sourcePaths.localDetailedView !== location.pathname) {
      console.log("[IconsContent] Navigating to source path from localStorage (detailedViewSourcePath):", sourcePaths.localDetailedView);
      navigate(sourcePaths.localDetailedView, { replace: true });
      localStorage.removeItem('detailedViewSourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    if (sourcePaths.sessionDetailedView && sourcePaths.sessionDetailedView !== location.pathname) {
      console.log("[IconsContent] Navigating to source path from sessionStorage (detailedViewSourcePath):", sourcePaths.sessionDetailedView);
      navigate(sourcePaths.sessionDetailedView, { replace: true });
      sessionStorage.removeItem('detailedViewSourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    if (sourcePaths.localStorage && sourcePaths.localStorage !== location.pathname) {
      console.log("[IconsContent] Navigating to source path from localStorage:", sourcePaths.localStorage);
      navigate(sourcePaths.localStorage, { replace: true });
      localStorage.removeItem('sourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    if (sourcePaths.sessionStorage && sourcePaths.sessionStorage !== location.pathname) {
      console.log("[IconsContent] Navigating to source path from sessionStorage:", sourcePaths.sessionStorage);
      navigate(sourcePaths.sessionStorage, { replace: true });
      sessionStorage.removeItem('sourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    const previousPath = getPreviousPage();
    console.log("[IconsContent] Falling back to previous page from history:", previousPath);
    navigate(previousPath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is the nature of being?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'How do we determine right from wrong?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is beauty?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
      { id: '4', title: 'What is the meaning of life?', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '5', title: 'How should society be organized?', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '6', title: 'What is knowledge?', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
    related_classics: [
      { id: '1', title: 'On the Genealogy of Morality', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Thus Spoke Zarathustra', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Beyond Good and Evil', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_icons: [
      { id: '1', title: 'Friedrich Nietzsche', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Immanuel Kant', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Virtue Ethics', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '2', title: 'Existentialism', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
      { id: '3', title: 'Nihilism', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
    ],
  };

  const isLoadingCombined = isLoadingIds || (!!currentIconId && isLoadingCurrentItem);
  const currentItem = currentItemData;

  if (isLoadingCombined && !currentItem) {
    return (
      <div className="h-full">
        <IconLoadingSkeleton />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          {currentItem ? (
            <ContentCard
              image={currentItem.illustration}
              title={currentItem.name}
              about={currentItem.about || ""}
              itemId={currentItem.id}
              itemType="icon"
              onLearnMore={() => handleLearnMore(currentItem)}
              onImageClick={() => handleLearnMore(currentItem)}
              hasPrevious={false}
              hasNext={false}
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-400">Loading icons...</p>
              <div className="animate-pulse mt-4 h-64 w-full bg-gray-700/30 rounded-lg"></div>
            </div>
          )}
        </div>
        {selectedIcon && (
          <DetailedView
            key={`icon-detail-${selectedIcon.id}`}
            type="icon"
            data={selectedIcon}
            onBack={handleCloseDetailedView}
          />
        )}
      </div>
    );
  }

  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < shuffledIds.length - 1;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {currentItem ? (
          <ContentCard
            image={currentItem.illustration}
            title={currentItem.name}
            about={currentItem.about || ""}
            itemId={currentItem.id}
            itemType="icon"
            onLearnMore={() => handleLearnMore(currentItem)}
            onImageClick={() => handleLearnMore(currentItem)}
            onPrevious={hasPreviousDesktop ? handlePrevious : undefined}
            onNext={hasNextDesktop ? handleNext : undefined}
            hasPrevious={hasPreviousDesktop}
            hasNext={hasNextDesktop}
          />
        ) : isLoadingCombined ? (
           <div className="animate-pulse text-gray-400">Loading...</div> 
        ) : (
           <p className="text-gray-500">No icons found.</p>
        )}
      </div>
      {selectedIcon && (
        <DetailedView
          key={`icon-detail-${selectedIcon.id}`}
          type="icon"
          data={selectedIcon}
          onBack={handleCloseDetailedView}
        />
      )}
    </div>
  );
};

export default IconsContent;
