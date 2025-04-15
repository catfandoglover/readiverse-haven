import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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

const PAGE_SIZE = 10;

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
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const [desktopIndex, setDesktopIndex] = useState(currentIndex);

  const { 
    data: classicsPages, 
    fetchNextPage, 
    hasNextPage, 
    isLoading, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ["classics-content-paginated"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      console.log(`Fetching classics page: ${pageParam}, range: ${from}-${to}`);
      try {
        const { data, error, count } = await supabase
          .from("books")
          .select("*", { count: 'exact' })
          .order("title", { ascending: true })
          .range(from, to);

        if (error) {
          console.error("Error fetching classics content page:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to load classics content" });
          throw error;
        }

        const generateSlug = (title: string): string => {
          if (!title) return '';
          return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        };

        const classics = data.map((book: any) => ({
          id: book.id,
          title: book.title,
          type: "classic" as const,
          image: book.icon_illustration || book.Cover_super || "",
          about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
          author: book.author,
          great_conversation: `${book.title} has played an important role in shaping intellectual discourse.`,
          Cover_super: book.Cover_super,
          epub_file_url: book.epub_file_url,
          slug: book.slug || (book.title ? generateSlug(book.title) : book.id),
        }));
        
        return { data: classics, count: count ?? 0 };

      } catch (error) {
        console.error("Error fetching classics content page:", error);
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

  const classicsItems = classicsPages?.pages.flatMap(page => page.data) ?? [];

  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNextPage) {
      console.log("Load more triggered...");
      fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (location.pathname.includes('/texts/')) {
      const pathSlug = location.pathname.split('/texts/')[1];
      console.log("Loading text by slug:", pathSlug);
      
      const locationState = location.state as { fromReader?: boolean, bookId?: string } | null;
      const comingFromReader = locationState?.fromReader;
      const bookId = locationState?.bookId;
      
      const fetchBookDirectly = async () => {
        try {
          console.log("Directly querying DB for book with slug:", pathSlug);
          
          if (comingFromReader && bookId) {
            console.log("Coming from reader with book ID:", bookId);
            const { data: dataById, error: errorById } = await supabase
              .from("books")
              .select("*")
              .eq("id", bookId)
              .single();
              
            if (dataById) {
              console.log("Found book by ID from reader navigation:", dataById.title);
              const book = {
                id: dataById.id,
                title: dataById.title,
                type: "classic" as const,
                image: dataById.icon_illustration || dataById.Cover_super || "",
                about: dataById.about || `A classic work by ${dataById.author || 'Unknown Author'}.`,
                author: dataById.author,
                great_conversation: `${dataById.title} has played an important role in shaping intellectual discourse.`,
                Cover_super: dataById.Cover_super,
                epub_file_url: dataById.epub_file_url,
                slug: dataById.slug || pathSlug,
              };
              
              setSelectedItem(book);
              if (onDetailedViewShow) onDetailedViewShow();
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
      
      const bookInLoadedData = classicsItems.find(book => 
        book.slug === pathSlug || 
        book.slug?.toLowerCase() === pathSlug.toLowerCase() ||
        book.title === "Botchan"
      );
      
      if (bookInLoadedData) {
        console.log("Found book in loaded data:", bookInLoadedData.title);
        setSelectedItem(bookInLoadedData);
        if (onDetailedViewShow) onDetailedViewShow();
      } else {
        console.log("Book not found in loaded items, fetching directly...");
        fetchBookDirectly();
      }
    }
  }, [location.pathname, classicsItems, onDetailedViewShow, supabase]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/texts/')) {
      saveSourcePath(currentPath);
      console.log('[ClassicsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const handlePrevious = () => {
    if (!isMobile && desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isMobile) {
      if (desktopIndex < classicsItems.length - 1) {
        setDesktopIndex(prevIndex => prevIndex + 1);
      } else if (hasNextPage && !isFetchingNextPage) {
        console.log("Desktop Next: Fetching next page...");
        fetchNextPage();
      }
    }
  };

  const getCurrentItem = () => classicsItems[desktopIndex] || null;

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
    
    const previousPath = getPreviousPage();
    console.log("[ClassicsContent] Navigating back to:", previousPath);
    
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

  if (isLoading && !classicsItems.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  console.log("ClassicsContent render - selectedItem:", selectedItem?.title, "location:", location.pathname);

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {classicsItems.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-700 last:border-b-0">
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
            ) : classicsItems.length > 0 ? (
              <p className="text-gray-600">End of list</p>
            ) : null } 
          </div>
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
  }

  const currentItem = getCurrentItem();
  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < classicsItems.length - 1 || (hasNextPage && !isFetchingNextPage);

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
