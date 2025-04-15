import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import VerticalSwiper, { VerticalSwiperHandle } from "@/components/common/VerticalSwiper";
import { useInView } from 'react-intersection-observer';

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

const PAGE_SIZE = 10;

const ConceptsContent: React.FC<ConceptsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { saveSourcePath, getSourcePath } = useNavigationState();
  const swiperRef = useRef<VerticalSwiperHandle>(null);
  const isMobile = useIsMobile();
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const [desktopIndex, setDesktopIndex] = useState(currentIndex);

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
        const { data, error, count } = await supabase
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

  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNextPage) {
      console.log("Load more concepts triggered...");
      fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const loadConceptFromUrl = async () => {
      if (location.pathname.includes('/concepts/')) {
        let fullPath = location.pathname.split('/concepts/')[1];
        
        fullPath = fullPath.replace(/\/$/, '');
        
        console.log("[ConceptsContent] Full path:", fullPath);
        
        const segments = fullPath.split('/');
        const lastSegment = segments[segments.length - 1];
        
        console.log("[ConceptsContent] Last segment:", lastSegment);
        
        let concept = concepts.find(c => 
          c.slug === fullPath || 
          c.slug === lastSegment || 
          c.title?.toLowerCase() === lastSegment.toLowerCase()
        );
        
        if (!concept) {
          console.log("[ConceptsContent] Concept not found in memory, querying database");
          
          let { data: exactMatchData, error: exactMatchError } = await supabase
            .from("concepts")
            .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
            .eq('slug', fullPath)
            .limit(1);
          
          if (!exactMatchData || exactMatchData.length === 0) {
            console.log("[ConceptsContent] Trying with last segment:", lastSegment);
            
            const { data: lastSegmentData, error: lastSegmentError } = await supabase
              .from("concepts")
              .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
              .or(`slug.eq.${lastSegment},title.ilike.%${lastSegment}%`)
              .limit(1);
            
            if (lastSegmentData && lastSegmentData.length > 0) {
              exactMatchData = lastSegmentData;
            }
          }
          
          if (!exactMatchData || exactMatchData.length === 0) {
            console.log("[ConceptsContent] Trying fuzzy match on title:", lastSegment);
            
            const { data: fuzzyMatchData, error: fuzzyMatchError } = await supabase
              .from("concepts")
              .select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer")
              .ilike('title', `%${lastSegment}%`)
              .limit(1);
            
            if (fuzzyMatchData && fuzzyMatchData.length > 0) {
              exactMatchData = fuzzyMatchData;
            }
          }
          
          if (exactMatchData && exactMatchData.length > 0) {
            concept = {
              ...exactMatchData[0],
              type: exactMatchData[0].concept_type || "concept",
              about: exactMatchData[0].about || `${exactMatchData[0].title} is a significant philosophical concept.`,
              genealogy: `The historical development of ${exactMatchData[0].title} spans multiple philosophical traditions.`,
              great_conversation: exactMatchData[0].great_conversation || `${exactMatchData[0].title} has been debated throughout philosophical history.`,
              image: exactMatchData[0].illustration,
            };
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
  }, [location.pathname, concepts, onDetailedViewShow, supabase, toast]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/concepts/')) {
      saveSourcePath(currentPath);
      console.log('[ConceptsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const handlePrevious = useCallback(() => {
    if (!isMobile && desktopIndex > 0) {
      setDesktopIndex(prevIndex => prevIndex - 1);
    }
  }, [isMobile, desktopIndex]);

  const handleNext = useCallback(() => {
    if (!isMobile) {
      if (desktopIndex < concepts.length - 1) {
        setDesktopIndex(prevIndex => prevIndex + 1);
      } else if (hasNextPage && !isFetchingNextPage) {
        console.log("Desktop Next (Concepts): Fetching next page...");
        fetchNextPage();
      }
    }
  }, [isMobile, desktopIndex, concepts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getCurrentItem = () => concepts[desktopIndex] || null;

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

  if (isLoading && !concepts.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {concepts.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-700 last:border-b-0">
              <ContentCard
                image={item.image || item.illustration}
                title={item.title}
                about={item.about || ''}
                itemId={item.id}
                itemType={item.type || 'concept'}
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
  }

  const currentItem = getCurrentItem();
  const hasPreviousDesktop = desktopIndex > 0;
  const hasNextDesktop = desktopIndex < concepts.length - 1 || (hasNextPage && !isFetchingNextPage);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {currentItem ? (
          <ContentCard
            image={currentItem.image || currentItem.illustration}
            title={currentItem.title}
            about={currentItem.about || ''}
            itemId={currentItem.id}
            itemType={currentItem.type || 'concept'}
            onPrevious={hasPreviousDesktop ? handlePrevious : undefined}
            onNext={hasNextDesktop ? handleNext : undefined}
            hasPrevious={hasPreviousDesktop}
            hasNext={hasNextDesktop}
            onLearnMore={() => handleLearnMore(currentItem)}
            onImageClick={() => handleLearnMore(currentItem)}
          />
        ) : isLoading ? (
          <div className="animate-pulse text-gray-400">Loading...</div>
        ) : (
          <p className="text-gray-500">No concepts found.</p>
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
