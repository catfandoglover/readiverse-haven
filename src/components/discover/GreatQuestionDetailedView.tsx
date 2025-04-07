import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Share, Star } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { saveLastVisited, getLastVisited, getPreviousPage, sections } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useFormatText } from "@/hooks/useFormatText";
import VirgilChatButton from "./VirgilChatButton";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useIsMobile } from "@/hooks/use-mobile";

interface CarouselItem {
  id: string;
  title?: string;
  name?: string;
  question?: string;
  image?: string;
  illustration?: string;
  cover_url?: string;
  Cover_super?: string;
  icon_illustration?: string;
  slug?: string;
  [key: string]: any;
}

interface GreatQuestionDetailedViewProps {
  data: any;
  onBack?: () => void;
}

const GreatQuestionDetailedView: React.FC<GreatQuestionDetailedViewProps> = ({
  data: itemData,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openLogin } = useAuth();
  const { toast } = useToast();
  const { getSourcePath, getFeedSourcePath, saveSourcePath } = useNavigationState();
  const [isFavorite, setIsFavorite] = useState(false);
  const { formatText } = useFormatText();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [combinedData, setCombinedData] = useState<any>(itemData);
  const [shouldBlurHeader, setShouldBlurHeader] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: enhancedData, isLoading: isEnhancedDataLoading } = useQuery({
    queryKey: ["question-details", itemData.id],
    queryFn: async () => {
      if (!itemData.id) return null;
      
      const { data, error } = await supabase
        .from("great_questions")
        .select("*")
        .eq('id', itemData.id)
        .single();
      
      if (error) {
        console.error(`Error fetching enhanced question data:`, error);
        return null;
      }
      
      return data;
    },
    staleTime: 60000,
  });

  const { data: relatedClassics = [] } = useQuery({
    queryKey: ["related-classics-for-question", itemData.id],
    queryFn: async () => {
      if (!itemData.id) return [];
      
      const { data: bookQuestions, error: bookQuestionsError } = await supabase
        .from("book_questions")
        .select("book_id")
        .eq("question_id", itemData.id);
      
      if (bookQuestionsError || !bookQuestions?.length) {
        console.error("Error fetching related book IDs:", bookQuestionsError);
        return [];
      }
      
      const bookIds = bookQuestions.map(bq => bq.book_id);
      
      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("*")
        .in("id", bookIds)
        .limit(10);
      
      if (booksError) {
        console.error("Error fetching related classics:", booksError);
        return [];
      }
      
      return books || [];
    },
    enabled: !!itemData.id,
  });

  const { data: concepts = [] } = useQuery({
    queryKey: ["related-concepts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("concepts")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  const { data: connectedIcons = [] } = useQuery({
    queryKey: ["connected-icons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("icons")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  useEffect(() => {
    if (!enhancedData && !isEnhancedDataLoading) return;
    
    setCombinedData({ 
      ...itemData,
      ...(enhancedData || {}),
      image: enhancedData?.illustration || itemData.illustration || ''
    });
  }, [itemData, enhancedData, isEnhancedDataLoading]);

  useEffect(() => {
    if (enhancedData || isEnhancedDataLoading === false) {
      setIsDataLoaded(true);
    }
  }, [enhancedData, isEnhancedDataLoading]);

  useEffect(() => {
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    document.head.appendChild(viewportMeta);

    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
      document.head.removeChild(viewportMeta);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current || !scrollContainerRef.current) return;
      
      const imageBottom = imageRef.current.getBoundingClientRect().bottom;
      const headerBottom = 60;
      
      setShouldBlurHeader(imageBottom <= headerBottom);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      handleScroll();
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (user && itemData.id) {
      const checkFavoriteStatus = async () => {
        try {
          const { data } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('item_id', itemData.id)
            .eq('user_id', user.id)
            .eq('item_type', 'question')
            .single();
          
          if (data) {
            setIsFavorite(true);
          }
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      };
      
      checkFavoriteStatus();
    }
  }, [user, itemData.id]);

  useEffect(() => {
    if (!isMobile && imageRef.current && scrollContainerRef.current && isDataLoaded) {
      const imageHeight = imageRef.current.clientHeight;
      const scrollTarget = imageHeight * 0.6; // 60% of the header image height

      // Small timeout to ensure the image is fully loaded
      const timer = setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollTarget,
          behavior: 'auto'
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isMobile, isDataLoaded]);

  const handleBack = () => {
    console.log("[GreatQuestionDetailedView] Back button clicked", {
      onBack: !!onBack,
      locationState: location.state,
      pathname: location.pathname
    });

    // First check if we have an explicit source path in the location state
    if (location.state?.sourcePath) {
      const sourcePath = location.state.sourcePath;
      console.log("[GreatQuestionDetailedView] Navigating to source path from location state:", sourcePath);
      navigate(sourcePath, { replace: true });
      return;
    }

    // If we have a callback, use it
    if (onBack) {
      console.log("[GreatQuestionDetailedView] Using onBack callback");
      onBack();
      return;
    }

    // Get source path from the navigation state hook (this is more robust)
    const sourcePath = getSourcePath();
    if (sourcePath && sourcePath !== location.pathname) {
      console.log("[GreatQuestionDetailedView] Navigating to source path from hook:", sourcePath);
      navigate(sourcePath, { replace: true });
      return;
    }

    // Try the feed source path as another option
    const feedPath = getFeedSourcePath();
    if (feedPath && feedPath !== location.pathname) {
      console.log("[GreatQuestionDetailedView] Navigating to feed source path:", feedPath);
      navigate(feedPath, { replace: true });
      return;
    }

    // If we have browser history, use that
    if (window.history.length > 1) {
      console.log("[GreatQuestionDetailedView] Using window.history.back()");
      window.history.back();
      return;
    }

    // Last resort: go to discover
    console.log("[GreatQuestionDetailedView] Fallback to discover feed");
    navigate('/discover', { replace: true });
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/view/question/${combinedData.id}`;
      const shareTitle = combinedData?.question || "Great Question";
      const shareText = combinedData.great_conversation || `Check out this great question!`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
          
          toast({
            description: "Successfully shared!",
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }
          
          await fallbackToClipboard(shareUrl);
        }
      } else {
        await fallbackToClipboard(shareUrl);
      }
    } catch (error) {
      console.error("Share error:", error);
      toast({
        variant: "destructive",
        description: "Unable to share. Please try again.",
      });
    }
  };

  const fallbackToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        description: "Link copied to clipboard!",
      });
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError);
      toast({
        variant: "destructive",
        description: "Couldn't copy to clipboard. Try manually copying the URL.",
      });
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      openLogin();
      return;
    }
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('item_id', combinedData.id)
          .eq('user_id', user.id)
          .eq('item_type', 'question');
          
        if (error) throw error;
        
        setIsFavorite(false);
        toast({
          description: "Question removed from favorites",
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            item_id: combinedData.id,
            user_id: user.id,
            item_type: 'question',
            added_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setIsFavorite(true);
        toast({
          description: "Question added to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        variant: "destructive",
        description: "Failed to update favorites. Please try again.",
      });
    }
  };

  const handleCarouselItemClick = (item: CarouselItem, itemType: "classic" | "concept" | "question" | "icon") => {
    // Get the current location to use for back navigation
    const currentPath = location.pathname;
    const currentQuestionId = combinedData?.id;
    
    // Save the source path using the hook - this is more reliable than manually setting storage
    saveSourcePath(currentPath);
    
    // Also store explicitly in localStorage to ensure back navigation works reliably
    // This is essential since window.location.href navigation loses React Router state
    if (currentQuestionId) {
      localStorage.setItem('last_question_path', currentPath);
      localStorage.setItem('last_question_id', currentQuestionId);
      console.log(`[GreatQuestionDetailedView] Saved question path for back navigation: ${currentPath}`);
    }
    
    console.log(`[GreatQuestionDetailedView] Clicked carousel item (${itemType}):`, item);
    
    // Generate a fallback slug if needed (especially for classics)
    if (itemType === "classic" && !item.slug && item.title) {
      // Generate a slug from the title
      item.slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      console.log(`[GreatQuestionDetailedView] Generated fallback slug for classic: ${item.slug}`);
    }
    
    // Navigate to the appropriate URL based on the item type
    switch(itemType) {
      case "classic":
        if (!item.slug) {
          console.error("[GreatQuestionDetailedView] Classic missing slug and no title to generate one:", item);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot navigate to this item"
          });
          return;
        }
        
        // For classics, we need to use the /texts/ path format
        const targetUrl = `/texts/${item.slug}`;
        console.log(`[GreatQuestionDetailedView] Navigating to classic at: ${targetUrl}`);
        
        // Include query parameter to indicate source path for back navigation
        window.location.href = `${targetUrl}?from_question=${currentQuestionId}`;
        break;
        
      case "concept":
        if (!item.slug) {
          console.error("[GreatQuestionDetailedView] Concept missing slug:", item);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot navigate to this item"
          });
          return;
        }
        // Include query parameter for back navigation
        const conceptUrl = `/concepts/${item.slug}?from_question=${currentQuestionId}`;
        console.log(`[GreatQuestionDetailedView] Navigating to concept at: ${conceptUrl}`);
        window.location.href = conceptUrl;
        break;
        
      case "icon":
        if (!item.slug) {
          console.error("[GreatQuestionDetailedView] Icon missing slug:", item);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot navigate to this item"
          });
          return;
        }
        // Include query parameter for back navigation
        const iconUrl = `/icons/${item.slug}?from_question=${currentQuestionId}`;
        console.log(`[GreatQuestionDetailedView] Navigating to icon at: ${iconUrl}`);
        window.location.href = iconUrl;
        break;
        
      case "question":
        // Include query parameter for back navigation
        const questionUrl = `/view/question/${item.id}?from_question=${currentQuestionId}`;
        console.log(`[GreatQuestionDetailedView] Navigating to question at: ${questionUrl}`);
        window.location.href = questionUrl;
        break;
    }
  };

  const renderHeader = () => (
    <header className={cn(
      "bg-transparent fixed top-0 left-0 right-0 z-10 transition-all duration-200",
      shouldBlurHeader ? "backdrop-blur-md bg-[#E9E7E2]/80" : ""
    )}>
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={handleBack}
          className={cn(
            "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
            shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
          )}
          aria-label="Back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className={cn(
            "font-oxanium text-sm uppercase tracking-wider font-bold",
            shouldBlurHeader ? "text-[#2A282A]" : "text-white"
          )}>
            GREAT QUESTION
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <VirgilChatButton
            contentTitle={combinedData?.question || "Great Question"}
            contentId={combinedData?.id || ""}
            contentType="question"
            className={cn(
              "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
              shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
            )}
            iconClassName={shouldBlurHeader ? "opacity-90" : "brightness-[1.2]"}
          />
          <button
            className={cn(
              "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
              shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={toggleFavorite}
          >
            <Star 
              className="h-5 w-5" 
              fill={isFavorite ? "#EFFE91" : "none"} 
              stroke={shouldBlurHeader ? "#2A282A" : "white"}
            />
          </button>
          <button
            className={cn(
              "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
              shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
            )}
            aria-label="Share"
            onClick={handleShare}
          >
            <Share className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );

  const renderHorizontalSlider = (title: string, items: CarouselItem[], imageKey: string = 'illustration', textKey: string = 'title', itemType: "classic" | "concept" | "question" | "icon") => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-libre-baskerville font-bold mb-4 text-[#2A282A] uppercase">{title}</h3>
        <ScrollArea className="w-full pb-4" enableDragging orientation="horizontal">
          <div className="flex space-x-4 min-w-max px-0.5 py-0.5">
            {items.map((item) => {
              let imageSrc = item[imageKey];
              
              if (itemType === "classic") {
                imageSrc = item.cover_url || item.Cover_super || item.icon_illustration || imageSrc;
              }
              
              return (
                <div
                  key={item.id}
                  className="relative flex-none cursor-pointer group w-36 sm:w-40 md:w-48 lg:w-52"
                  onClick={() => handleCarouselItemClick(item, itemType)}
                >
                  <div className="aspect-square w-full rounded-2xl overflow-hidden mb-2">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl">
                      <img
                        src={imageSrc || ''}
                        alt={item[textKey] || ""}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        draggable="false"
                      />
                    </div>
                  </div>
                  <h4 className={cn(
                    "text-sm font-oxanium uppercase group-hover:text-[#9b87f5] transition-colors",
                    "w-full break-words line-clamp-2",
                    "text-[#2A282A]"
                  )}>
                    {item[textKey]}
                  </h4>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#E9E7E2] text-[#2A282A] overflow-hidden">
      {renderHeader()}
      
      <div 
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto" 
        style={{ 
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)" 
        }}
      >
        <div ref={imageRef} className="w-full flex justify-center items-center bg-[#2A282A]">
          <img 
            src={combinedData?.image} 
            alt={combinedData?.question} 
            className="max-w-full max-h-[100vh] object-contain" 
            style={{ 
              aspectRatio: "1/1",
              width: "100%"
            }} 
          />
        </div>

        <div className="relative -mt-6">
          <div 
            className={cn(
              "bg-[#E9E7E2] rounded-t-2xl",
              isMobile ? "p-6" : "px-[18%] py-8"
            )}
          >
            <h2 className="text-2xl font-baskerville mb-6 text-[#2A282A]">
              {combinedData?.question}
            </h2>
            
            {isEnhancedDataLoading ? (
              <div className="h-20 bg-gray-200 animate-pulse rounded mb-8"></div>
            ) : combinedData?.great_conversation ? (
              <div className="mb-8">
                <p className={cn(
                  "text-gray-800 font-baskerville",
                  isMobile ? "text-lg" : "text-xl leading-relaxed"
                )}>
                  {formatText(combinedData.great_conversation)}
                </p>
              </div>
            ) : (
              <p className={cn(
                "text-gray-800 font-baskerville mb-8 italic",
                isMobile ? "text-lg" : "text-xl leading-relaxed"
              )}>
                Great conversation content will appear here when available.
              </p>
            )}

            {renderHorizontalSlider("RELATED CLASSICS", relatedClassics, "cover_url", "title", "classic")}

            {renderHorizontalSlider("MAJOR THEMES", concepts, "illustration", "title", "concept")}

            {renderHorizontalSlider("CONNECTED ICONS", connectedIcons, "illustration", "name", "icon")}
            
            <div className="h-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreatQuestionDetailedView;
