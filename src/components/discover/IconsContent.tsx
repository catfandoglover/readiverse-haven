import React, { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { useInView } from 'react-intersection-observer';

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

const PAGE_SIZE = 10;

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
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const [desktopIndex, setDesktopIndex] = useState(currentIndex);
  
  useEffect(() => {
    if (!location.pathname.includes('/view/')) {
      saveSourcePath(location.pathname);
      console.log('[IconsContent] Saved source path:', location.pathname);
    }
  }, [location.pathname, saveSourcePath]);

  const { 
    data: iconsPages, 
    fetchNextPage, 
    hasNextPage, 
    isLoading, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ["icons-paginated"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      console.log(`Fetching icons page: ${pageParam}, range: ${from}-${to}`);
      try {
        const { data, error, count } = await supabase
          .from("icons")
          .select("*", { count: 'exact' })
          .order("name", { ascending: true })
          .range(from, to);

        if (error) {
          console.error("Error fetching icons page:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to load icons" });
          throw error;
        }

        const iconsData = data.map((icon: any) => ({
          ...icon,
          slug: icon.slug || icon.name?.toLowerCase().replace(/\s+/g, '-') || '',
          about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
          great_conversation: icon.great_conversation || `${icon.name}'s contributions to philosophical discourse were substantial and continue to influence modern thought.`,
          anecdotes: icon.anecdotes || `Various interesting stories surround ${icon.name}'s life and work.`,
        })) as Icon[];

        return { data: iconsData, count: count ?? 0 };

      } catch (error) {
        console.error("Error fetching icons page:", error);
        return { data: [], count: 0 };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.data.length, 0);
      const totalCount = lastPage.count;
      if (totalFetched < totalCount) {
        return lastPageParam + 1;
      }
      return undefined;
    },
  });

  const icons = iconsPages?.pages.flatMap(page => page.data) ?? [];

  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNextPage) {
      console.log("Load more icons triggered...");
      fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (location.pathname.includes('/icons/')) {
      const iconParam = location.pathname.split('/icons/')[1];
      console.log("[IconsContent] Icon param detected:", iconParam);
      
      if (!selectedIcon || selectedIcon.slug !== iconParam) {
        console.log("[IconsContent] Loading icon from URL param");
        const icon = icons.find(i => i.slug === iconParam);
        
        if (icon) {
          console.log("[IconsContent] Found matching icon in list:", icon.name);
          setSelectedIcon({...icon});
          if (onDetailedViewShow) onDetailedViewShow();
        } else {
          console.log("[IconsContent] Icon not found in current list, fetching directly");
          fetchIconDirectly(iconParam);
        }
      }
    } else if (selectedIcon) {
      setSelectedIcon(null);
    }
  }, [location.pathname, icons, location.key, selectedIcon]);

  const fetchIconDirectly = async (iconSlug: string) => {
    try {
      console.log("[IconsContent] Directly fetching icon with slug:", iconSlug);
      
      const { data, error } = await supabase
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

  const handlePrevious = useCallback(() => {
    if (!isMobile && desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  }, [isMobile, desktopIndex]);

  const handleNext = useCallback(() => {
    if (!isMobile) {
      if (desktopIndex < icons.length - 1) {
        setDesktopIndex(prevIndex => prevIndex + 1);
      } else if (hasNextPage && !isFetchingNextPage) {
        console.log("Desktop Next (Icons): Fetching next page...");
        fetchNextPage();
      }
    }
  }, [isMobile, desktopIndex, icons.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getCurrentItem = () => icons[desktopIndex] || null;

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

  if (isLoading && !icons.length) {
    return (
      <div className="h-full">
        <IconLoadingSkeleton />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {icons.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-700 last:border-b-0">
              <ContentCard
                image={item.illustration}
                title={item.name}
                about={item.about || ""}
                itemId={item.id}
                itemType="icon"
                onLearnMore={() => handleLearnMore(item)}
                onImageClick={() => handleLearnMore(item)}
                hasPrevious={false}
                hasNext={false}
              />
            </div>
          ))}
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
            {/* ... Load more indicator ... */}
          </div>
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

  const currentItem = getCurrentItem();
  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < icons.length - 1 || (hasNextPage && !isFetchingNextPage);

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
        ) : isLoading ? (
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
