import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import VerticalSwiper, { VerticalSwiperHandle } from "@/components/common/VerticalSwiper";

interface Concept {
  id: string;
  title: string;
  illustration: string;
  image?: string;
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

// Define PAGE_SIZE
const PAGE_SIZE = 5;

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

const fetchAllConceptIds = async () => {
  try {
    // Fetch all concept IDs
    const { data, error } = await supabaseClient.from("concepts").select("id");

    if (error) {
      console.error("Error fetching all concept IDs:", error);
      return [];
    }

    return data.map((item) => item.id);
  } catch (error) {
    console.error("Error in fetchAllConceptIds:", error);
    return [];
  }
};

// Direct query by slug
const fetchConceptBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabaseClient
      .from("concepts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching concept by slug:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchConceptBySlug:", error);
    return null;
  }
};

const ConceptsContent: React.FC<ConceptsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { saveSourcePath, getSourcePath } = useNavigationState();
  const swiperRef = useRef<VerticalSwiperHandle>(null);
  const isMobile = useIsMobile();
  const [desktopIndex, setDesktopIndex] = useState(0); // Start at 0
  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { 
    data: conceptsPages, 
    fetchNextPage, 
    hasNextPage, 
    isLoading, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ["concepts-paginated"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      console.log(`Fetching concepts page: ${pageParam}, range: ${from}-${to}`);
      try {
        const { data, error, count } = await supabaseClient
          .from("concepts")
          .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer", { count: 'exact' })
          .order("title", { ascending: true })
          .range(from, to);

        if (error) {
          console.error("Error fetching concepts page:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to load concepts" });
          throw error;
        }

        const conceptsData = data.map((concept: any) => ({
          ...concept,
          type: concept.concept_type || "concept",
          about: concept.about || concept.description || `${concept.title} is a significant philosophical concept.`,
          genealogy: concept.genealogy || `The historical development of ${concept.title} spans multiple philosophical traditions.`,
          great_conversation: concept.great_conversation || `${concept.title} has been debated throughout philosophical history.`,
          image: concept.illustration,
        }));

        return { data: conceptsData, count: count ?? 0 };

      } catch (error) {
        console.error("Error fetching concepts page:", error);
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

  const concepts = conceptsPages?.pages.flatMap(page => page.data) ?? [];

  // Flatten pages (memoize potentially)
  const allFetchedItems = useMemo(() => conceptsPages?.pages.flatMap(page => page.data) ?? [], [conceptsPages]);

  // Query 1: Fetch all Concept IDs
  const { data: allConceptIds, isLoading: isLoadingIds } = useQuery({
    queryKey: ["all-concepts-ids"],
    queryFn: async () => {
      console.log("Fetching all concept IDs...");
      const { data, error } = await supabaseClient
        .from("concepts")
        .select("id");
      if (error) {
        console.error("Error fetching concept IDs:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load concept IDs" });
        return [];
      }
      return data.map(item => item.id);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Effect to shuffle IDs once fetched
  useEffect(() => {
    if (allConceptIds && allConceptIds.length > 0) {
      console.log("[ShuffleEffect Concepts] Shuffling IDs...");
      setShuffledIds(shuffleArray(allConceptIds));
      setDesktopIndex(0); // Reset index
    }
  }, [allConceptIds]);

  // Determine the current ID
  const currentConceptId = useMemo(() => {
      if (shuffledIds.length > 0 && desktopIndex >= 0 && desktopIndex < shuffledIds.length) {
          return shuffledIds[desktopIndex];
      }
      return null;
  }, [shuffledIds, desktopIndex]);

  // Define the query function separately for reuse
  const fetchConceptDetails = async (conceptId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("concepts")
        .select("*")
        .eq("id", conceptId)
        .single();

      if (error) {
        console.error("Error fetching concept details:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in fetchConceptDetails:", error);
      return null;
    }
  };

  // Query 2: Fetch details for the current Concept ID
  const { 
    data: currentItemData, 
    isLoading: isLoadingCurrentItem, 
    isError: isCurrentItemError 
  } = useQuery({
    queryKey: ["concept-details", currentConceptId],
    queryFn: () => fetchConceptDetails(currentConceptId), // Use separated function
    enabled: !!currentConceptId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Effect for Pre-fetching next items - Optimized to only prefetch 1-2 items ahead
  useEffect(() => {
    const prefetchCount = 2; // Reduced from 3 to 2 for better performance
    if (shuffledIds.length > 0) {
      // Prioritize prefetching the next item first
      const nextIndex = desktopIndex + 1;
      if (nextIndex < shuffledIds.length) {
        const nextId = shuffledIds[nextIndex];
        console.log(`[Prefetch Concepts] Prefetching next ID: ${nextId}`);
        queryClient.prefetchQuery({
          queryKey: ['concept-details', nextId],
          queryFn: () => fetchConceptDetails(nextId),
          staleTime: 5 * 60 * 1000
        });
      }
      
      // Then prefetch the one after that with a delay
      if (prefetchCount > 1) {
        const secondNextIndex = desktopIndex + 2;
        if (secondNextIndex < shuffledIds.length) {
          setTimeout(() => {
            const secondNextId = shuffledIds[secondNextIndex];
            console.log(`[Prefetch Concepts] Prefetching second next ID: ${secondNextId}`);
            queryClient.prefetchQuery({
              queryKey: ['concept-details', secondNextId],
              queryFn: () => fetchConceptDetails(secondNextId),
              staleTime: 5 * 60 * 1000
            });
          }, 500); // Add delay to prioritize loading the immediate next item
        }
      }
    }
  }, [desktopIndex, shuffledIds, queryClient, fetchConceptDetails]);

  useEffect(() => {
    const loadConceptFromUrl = async () => {
      if (location.pathname.includes('/concepts/')) {
        let fullPath = location.pathname.split('/concepts/')[1];
        
        fullPath = fullPath.replace(/\/$/, '');
        
        console.log("[ConceptsContent] Full path:", fullPath);
        
        const segments = fullPath.split('/');
        const lastSegment = segments[segments.length - 1];
        
        console.log("[ConceptsContent] Last segment:", lastSegment);
        
        let concept = allFetchedItems.find(c => 
          c.slug === fullPath || 
          c.slug === lastSegment || 
          c.title?.toLowerCase() === lastSegment.toLowerCase()
        );
        
        if (!concept) {
          console.log("[ConceptsContent] Concept not found in memory, querying database");
          
          // Try fetching by the full path slug
          concept = await fetchConceptBySlug(fullPath);
          
          // If not found, try with the last segment
          if (!concept) {
            console.log("[ConceptsContent] Trying with last segment:", lastSegment);
            concept = await fetchConceptBySlug(lastSegment);
          }
          
          // If still not found, try a fallback with direct query for fuzzy match
          if (!concept) {
            console.log("[ConceptsContent] Trying fuzzy match on title:", lastSegment);
            
            const { data: fuzzyMatchData, error: fuzzyMatchError } = await supabaseClient
              .from("concepts")
              .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
              .ilike('title', `%${lastSegment}%`)
              .limit(1);
            
            if (fuzzyMatchData && fuzzyMatchData.length > 0) {
              concept = {
                ...fuzzyMatchData[0],
                type: fuzzyMatchData[0].concept_type || "concept",
                about: fuzzyMatchData[0].about || `${fuzzyMatchData[0].title} is a significant philosophical concept.`,
                great_conversation: fuzzyMatchData[0].great_conversation || `${fuzzyMatchData[0].title} has been debated throughout philosophical history.`,
                image: fuzzyMatchData[0].illustration,
              };
            }
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
  }, [location.pathname, allFetchedItems, onDetailedViewShow, supabaseClient, toast]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/concepts/')) {
      saveSourcePath(currentPath);
      console.log('[ConceptsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const handlePrevious = useCallback(() => {
    if (desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  }, [desktopIndex]);

  const handleNext = useCallback(() => {
    if (desktopIndex < shuffledIds.length - 1) {
      setDesktopIndex(prevIndex => prevIndex + 1);
    }
  }, [desktopIndex, shuffledIds.length]);

  const handleLearnMore = (concept: Concept) => {
    setSelectedConcept(concept);
    
    const sourcePath = location.pathname;
    console.log("[ConceptsContent] Setting source path for detail view:", sourcePath);
    
    saveSourcePath(sourcePath);
    
    let slug = concept.slug;
    
    if (!slug || !slug.includes('/')) {
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

  // --- Adapt Rendering Logic --- 
  const isLoadingCombined = isLoadingIds || (!!currentConceptId && isLoadingCurrentItem);
  const currentItem = currentItemData;

  if (isLoadingCombined && !currentItem) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Mobile View (Placeholder/Update required)
  if (isMobile) {
    // Simplified vertical swiper implementation for mobile view
    return (
      <div className="h-full flex flex-col">
        {!selectedConcept && shuffledIds.length > 0 ? (
          <VerticalSwiper 
            initialIndex={desktopIndex}
            onIndexChange={(index) => {
              if (index !== desktopIndex) {
                setDesktopIndex(index);
                
                // Only prefetch the next item to avoid overloading
                const nextIndex = index + 1;
                if (nextIndex < shuffledIds.length) {
                  const nextId = shuffledIds[nextIndex];
                  queryClient.prefetchQuery({
                    queryKey: ['concept-details', nextId],
                    queryFn: () => fetchConceptDetails(nextId),
                    staleTime: 5 * 60 * 1000
                  });
                }
              }
            }}
            preloadCount={1}
          >
            {shuffledIds.map((conceptId, index) => (
              <div key={conceptId} className="h-full flex items-center justify-center p-4">
                {index === desktopIndex && currentItem ? (
                  <ContentCard
                    image={currentItem.image || currentItem.illustration}
                    title={currentItem.title}
                    about={currentItem.about || currentItem.description || ''}
                    itemId={currentItem.id}
                    itemType={currentItem.type || 'concept'}
                    onLearnMore={() => handleLearnMore(currentItem)}
                    onImageClick={() => handleLearnMore(currentItem)}
                    hasPrevious={index > 0}
                    hasNext={index < shuffledIds.length - 1}
                    swiperMode={true}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-[#E9E7E2]/60">Loading...</p>
                    <div className="animate-pulse mt-4 h-64 w-64 bg-[#3F3A46]/30 rounded-lg"></div>
                  </div>
                )}
              </div>
            ))}
          </VerticalSwiper>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#E9E7E2]/60">Loading concepts...</p>
              <div className="animate-pulse mt-4 h-64 w-64 bg-[#3F3A46]/30 rounded-lg"></div>
            </div>
          </div>
        )}
        
        {selectedConcept && (
          <DetailedView
            type="concept"
            data={selectedConcept}
            onBack={handleCloseDetailedView}
          />
        )}
      </div>
    );
  }

  // Desktop: Single Card View
  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < shuffledIds.length - 1;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-[#2A282A]">
        {currentItem ? (
          <ContentCard
            image={currentItem.image || currentItem.illustration}
            title={currentItem.title}
            about={currentItem.about || currentItem.description || ''}
            itemId={currentItem.id}
            itemType={currentItem.type || 'concept'}
            onLearnMore={() => handleLearnMore(currentItem)}
            onImageClick={() => handleLearnMore(currentItem)}
            onPrevious={hasPreviousDesktop ? handlePrevious : undefined}
            onNext={hasNextDesktop ? handleNext : undefined}
            hasPrevious={hasPreviousDesktop}
            hasNext={hasNextDesktop}
          />
        ) : isLoading ? (
          <div className="animate-pulse text-[#E9E7E2]/60">Loading...</div>
        ) : (
          <p className="text-[#E9E7E2]/80">No concepts found.</p>
        )}
      </div>
      {selectedConcept && (
        <DetailedView
          type="concept"
          data={{
            ...selectedConcept,
            image: selectedConcept.image || selectedConcept.illustration
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </div>
  );
};

export default ConceptsContent;
