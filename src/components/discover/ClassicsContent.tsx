import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useBookshelfManager } from "@/hooks/useBookshelfManager";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationState } from "@/hooks/useNavigationState";
import VerticalSwiper, { VerticalSwiperHandle } from "@/components/common/VerticalSwiper";
import { useIsMobile } from "@/hooks/use-mobile";

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

const ClassicsContent: React.FC<ForYouContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToBookshelf } = useBookshelfManager();
  const { user } = useAuth();
  const { getLastContentPath, saveSourcePath, getSourcePath } = useNavigationState();
  const params = useParams();
  const swiperRef = useRef<VerticalSwiperHandle>(null);
  const isMobile = useIsMobile();
  const [desktopIndex, setDesktopIndex] = useState(0); // Start at 0
  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const queryClient = useQueryClient(); // Initialize queryClient

  // Query 1: Fetch all Classic IDs
  const { data: allClassicIds, isLoading: isLoadingIds } = useQuery({
    queryKey: ["all-classics-ids"],
    queryFn: async () => {
      console.log("Fetching all classic IDs...");
      const { data, error } = await supabase
        .from("books")
        .select("id"); // Select only IDs
      if (error) {
        console.error("Error fetching classic IDs:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load classic IDs" });
        return [];
      }
      return data.map(item => item.id);
    },
    staleTime: Infinity, // IDs don't change often, keep them stale indefinitely
    gcTime: Infinity,
  });

  // Effect to shuffle IDs once fetched
  useEffect(() => {
    if (allClassicIds && allClassicIds.length > 0) {
      console.log("[ShuffleEffect Classics] Shuffling IDs...");
      setShuffledIds(shuffleArray(allClassicIds));
      setDesktopIndex(0); // Reset index when IDs are shuffled
    }
  }, [allClassicIds]);

  // Determine the current ID based on the shuffled list and index
  const currentBookId = useMemo(() => {
      if (shuffledIds.length > 0 && desktopIndex >= 0 && desktopIndex < shuffledIds.length) {
          return shuffledIds[desktopIndex];
      }
      return null;
  }, [shuffledIds, desktopIndex]);

  // Define the query function separately to reuse it for prefetching
  const fetchBookDetails = async (bookId: string | null) => {
    if (!bookId) return null;
    console.log(`Fetching details for book ID: ${bookId}`);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error) {
      console.error(`Error fetching details for book ${bookId}:`, error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load book details" });
      return null;
    }
    
    const generateSlug = (title: string): string => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return {
      ...data,
      type: "classic" as const,
      image: data.icon_illustration || data.Cover_super || "",
      about: data.about || `A classic work by ${data.author || 'Unknown Author'}.`,
      slug: data.slug || (data.title ? generateSlug(data.title) : data.id),
    };
  };

  // Query 2: Fetch details for the *current* book ID
  const { 
    data: currentItemData, 
    isLoading: isLoadingCurrentItem, 
    isError: isCurrentItemError 
  } = useQuery({
    queryKey: ["book-details", currentBookId],
    queryFn: () => fetchBookDetails(currentBookId), // Use the separated function
    enabled: !!currentBookId,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });

  // Effect for Pre-fetching next items
  useEffect(() => {
    const prefetchCount = 3; // How many items ahead to prefetch
    if (shuffledIds.length > 0) {
      for (let i = 1; i <= prefetchCount; i++) {
        const prefetchIndex = desktopIndex + i;
        if (prefetchIndex < shuffledIds.length) {
          const prefetchId = shuffledIds[prefetchIndex];
          console.log(`[Prefetch Classics] Prefetching ID: ${prefetchId}`);
          queryClient.prefetchQuery({
            queryKey: ['book-details', prefetchId],
            queryFn: () => fetchBookDetails(prefetchId), // Reuse the query function
            staleTime: 5 * 60 * 1000 // Match staleTime
          });
        }
      }
    }
  }, [desktopIndex, shuffledIds, queryClient, fetchBookDetails]); // Add fetchBookDetails to dependency array

  useEffect(() => {
    if (location.pathname.includes('/texts/')) {
      const pathSlug = location.pathname.split('/texts/')[1];
      console.log("Loading text by slug:", pathSlug);
      
      const locationState = location.state as { fromReader?: boolean, bookId?: string } | null;
      const comingFromReader = locationState?.fromReader;
      const bookId = locationState?.bookId;
      
      const fetchBookDirectly = async () => {
        try {
          console.log("[ClassicsContent] Directly querying DB for book with slug:", pathSlug);
          
          // Tell the parent immediately that we're showing a detailed view
          // This helps ensure the UI updates correctly
          if (onDetailedViewShow) onDetailedViewShow();
          
          if (comingFromReader && bookId) {
            console.log("[ClassicsContent] Coming from reader with book ID:", bookId);
            const { data: dataById, error: errorById } = await supabase
              .from("books")
              .select("*")
              .eq("id", bookId)
              .single();
              
            if (dataById) {
              console.log("[ClassicsContent] Found book by ID from reader navigation:", dataById.title);
              const book = {
                id: dataById.id,
                title: dataById.title,
                type: "classic" as const,
                image: dataById.cover_url || dataById.Cover_super || dataById.icon_illustration || "",
                about: dataById.about || `A classic work by ${dataById.author || 'Unknown Author'}.`,
                author: dataById.author,
                author_id: dataById.author_id,
                great_conversation: dataById.great_conversation || `${dataById.title} has played an important role in shaping intellectual discourse.`,
                Cover_super: dataById.Cover_super,
                cover_url: dataById.cover_url,
                epub_file_url: dataById.epub_file_url,
                slug: dataById.slug || pathSlug,
              };
              
              setSelectedItem(book);
              return;
            }
          }
          
          let { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("slug", pathSlug)
            .single();
            
          if (!data && error) {
            console.log("Exact slug match failed, trying case-insensitive match");
            const { data: dataILike, error: errorILike } = await supabase
              .from("books")
              .select("*")
              .ilike("slug", pathSlug)
              .single();
              
            if (dataILike) {
              data = dataILike;
              error = null;
            }
          }
          
          if (!data && error) {
            console.log("Slug matches failed, trying title match");
            const titleFromSlug = pathSlug.replace(/-/g, ' ')
                                      .split(' ')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                      .join(' ');
                                      
            const { data: dataTitle, error: errorTitle } = await supabase
              .from("books")
              .select("*")
              .eq("title", titleFromSlug)
              .single();
              
            if (dataTitle) {
              data = dataTitle;
              error = null;
            }
          }
          
          if (!data && (pathSlug === "Botchan" || pathSlug.toLowerCase() === "botchan")) {
            console.log("Special case: Trying to find Botchan by title");
            const { data: specialData, error: specialError } = await supabase
              .from("books")
              .select("*")
              .eq("title", "Botchan")
              .single();
              
            if (specialData) {
              data = specialData;
              error = null;
            }
          }
          
          if (data) {
            console.log("Found book directly from database:", data.title);
            const book = {
              id: data.id,
              title: data.title,
              type: "classic" as const,
              image: data.icon_illustration || data.Cover_super || "",
              about: data.about || `A classic work by ${data.author || 'Unknown Author'}.`,
              author: data.author,
              great_conversation: `${data.title} has played an important role in shaping intellectual discourse.`,
              Cover_super: data.Cover_super,
              epub_file_url: data.epub_file_url,
              slug: data.slug || pathSlug,
            };
            
            setSelectedItem(book);
            if (onDetailedViewShow) onDetailedViewShow();
          } else {
            console.error("Failed to find book directly from database, but continuing with current view:", error);
          }
        } catch (error) {
          console.error("Error fetching book directly, but continuing with current view:", error);
        }
      };
      
      // Try to find the book in *allFetchedItems* first
      const bookInLoadedData = allClassicIds.find(id => 
        id === pathSlug || 
        id?.toLowerCase() === pathSlug.toLowerCase() ||
        pathSlug === "Botchan"
      );
      
      if (bookInLoadedData) {
        console.log("Found book in loaded data:", bookInLoadedData);
        setSelectedItem({
          id: bookInLoadedData,
          title: bookInLoadedData,
          type: "classic" as const,
          image: "",
          about: "",
        });
        if (onDetailedViewShow) onDetailedViewShow();
      } else {
        console.log("Book not found in loaded items, fetching directly...");
        fetchBookDirectly();
      }
    }
  }, [location.pathname, allClassicIds, onDetailedViewShow, supabase]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/texts/')) {
      saveSourcePath(currentPath);
      console.log('[ClassicsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const handlePrevious = () => {
    if (desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNext = () => {
    if (desktopIndex < shuffledIds.length - 1) {
      setDesktopIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleLearnMore = (item: ForYouContentItem) => {
    if (!item.slug) {
      console.error("Book missing slug:", item);
      return;
    }
    
    const currentPath = location.pathname;
    console.log("[ClassicsContent] Setting source path for detail view:", currentPath);
    saveSourcePath(currentPath);

    setSelectedItem(item);
    
    const formattedSlug = item.slug.toLowerCase();
    const targetUrl = `/texts/${formattedSlug}`;
    
    navigate(targetUrl, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: currentPath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    
    const sourcePaths = {
      localStorage: localStorage.getItem('sourcePath'),
      sessionStorage: sessionStorage.getItem('sourcePath'),
      localDetailedView: localStorage.getItem('detailedViewSourcePath'),
      sessionDetailedView: sessionStorage.getItem('detailedViewSourcePath')
    };
    
    console.log("[ClassicsContent] Available source paths for back navigation:", sourcePaths);
    
    if (sourcePaths.localDetailedView && sourcePaths.localDetailedView !== location.pathname) {
      console.log("[ClassicsContent] Navigating to source path from localStorage (detailedViewSourcePath):", sourcePaths.localDetailedView);
      navigate(sourcePaths.localDetailedView, { replace: true });
      localStorage.removeItem('detailedViewSourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    if (sourcePaths.sessionDetailedView && sourcePaths.sessionDetailedView !== location.pathname) {
      console.log("[ClassicsContent] Navigating to source path from sessionStorage (detailedViewSourcePath):", sourcePaths.sessionDetailedView);
      navigate(sourcePaths.sessionDetailedView, { replace: true });
      sessionStorage.removeItem('detailedViewSourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    if (sourcePaths.localStorage && sourcePaths.localStorage !== location.pathname) {
      console.log("[ClassicsContent] Navigating to source path from localStorage:", sourcePaths.localStorage);
      navigate(sourcePaths.localStorage, { replace: true });
      localStorage.removeItem('sourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    if (sourcePaths.sessionStorage && sourcePaths.sessionStorage !== location.pathname) {
      console.log("[ClassicsContent] Navigating to source path from sessionStorage:", sourcePaths.sessionStorage);
      navigate(sourcePaths.sessionStorage, { replace: true });
      sessionStorage.removeItem('sourcePath');
      
      if (onDetailedViewHide) onDetailedViewHide();
      return;
    }
    
    const previousPath = getPreviousPage();
    console.log("[ClassicsContent] Falling back to previous page from history:", previousPath);
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

  useEffect(() => {
    if (selectedItem && onDetailedViewShow) {
      console.log("Showing DetailedView for selected item:", selectedItem.title);
      onDetailedViewShow();
    }
  }, [selectedItem, onDetailedViewShow]);

  useEffect(() => {
    if (selectedItem) {
      console.log("Selected item state updated:", selectedItem.title);
    }
  }, [selectedItem]);

  const isLoadingCombined = isLoadingIds || (!!currentBookId && isLoadingCurrentItem);
  const currentItem = currentItemData; // Use the fetched item directly

  if (isLoadingCombined && !currentItem) { // Show loading if IDs or current item details are loading
     return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  console.log("ClassicsContent render - selectedItem:", selectedItem?.title, "location:", location.pathname);

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-gray-400">Mobile view TBD</p>
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
        ) : isLoadingCombined ? ( // Still show loading if currentItem is null but we expect it
           <div className="animate-pulse text-gray-400">Loading...</div> 
        ) : isCurrentItemError ? (
           <p className="text-red-500">Error loading this classic.</p> // Handle item load error
        ) : (
           <p className="text-gray-500">No classics found.</p>
        )}
      </div>

      {selectedItem && (
        <DetailedView
          type={selectedItem.type}
          data={selectedItem}
          onBack={handleCloseDetailedView}
        />
      )}
    </div>
  );
};

export default ClassicsContent;
