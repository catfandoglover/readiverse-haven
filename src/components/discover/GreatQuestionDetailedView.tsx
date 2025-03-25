
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Share, Star } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { saveLastVisited, getLastVisited, getPreviousPage, sections } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useFormatText } from "@/hooks/useFormatText";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const { formatText } = useFormatText();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [combinedData, setCombinedData] = useState<any>(itemData);
  const [shouldBlurHeader, setShouldBlurHeader] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      
      // First, get related book IDs from the book_questions table
      const { data: bookQuestions, error: bookQuestionsError } = await supabase
        .from("book_questions")
        .select("book_id")
        .eq("question_id", itemData.id);
      
      if (bookQuestionsError || !bookQuestions?.length) {
        console.error("Error fetching related book IDs:", bookQuestionsError);
        return [];
      }
      
      const bookIds = bookQuestions.map(bq => bq.book_id);
      
      // Then, get the actual books
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
            .eq('outseta_user_id', user.Uid)
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

  const handleBack = () => {
    console.log("Back button clicked, location state:", location.state);
    
    if (onBack) {
      onBack();
      return;
    }
    
    const previousPage = getPreviousPage();
    console.log("Previous page from history:", previousPage);
    
    if (previousPage && previousPage !== location.pathname && previousPage !== '/dna') {
      console.log("Navigating to previous page:", previousPage);
      navigate(previousPage);
    } 
    else if (location.state?.fromSection) {
      const fromSection = location.state.fromSection as keyof typeof sections;
      const lastVisitedPath = getLastVisited(fromSection);
      console.log("Navigating to section:", fromSection, "path:", lastVisitedPath);
      navigate(lastVisitedPath);
    }
    else if (window.history.length > 1) {
      console.log("Using browser history navigation");
      navigate(-1);
    } 
    else {
      console.log("Fallback to discover page");
      navigate('/discover');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/great-questions/${combinedData.id}`;
      const shareTitle = combinedData.question || "Great Question";
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
          .eq('outseta_user_id', user.Uid)
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
            outseta_user_id: user.Uid,
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
    let targetType: "classic" | "concept" | "icon" | "question" = "classic";
    
    switch(itemType) {
      case "classic":
        targetType = "classic";
        break;
      case "concept":
        targetType = "concept";
        break;
      case "icon":
        targetType = "icon";
        break;
      case "question":
        targetType = "question";
        break;
    }
    
    navigate(`/view/${targetType}/${item.id}`, { replace: true });
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
          aria-label="Back to Discover"
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
        <h3 className="text-2xl font-oxanium mb-4 text-[#2A282A] uppercase">{title}</h3>
        <ScrollArea className="w-full pb-4" enableDragging orientation="horizontal">
          <div className="flex space-x-4 min-w-max px-0.5 py-0.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex-none cursor-pointer group"
                onClick={() => handleCarouselItemClick(item, itemType)}
              >
                <div className="h-36 w-36 rounded-lg overflow-hidden mb-2">
                  <div className="relative h-full w-full overflow-hidden rounded-[0.4rem]">
                    <img
                      src={item[imageKey] || ''}
                      alt={item[textKey] || ""}
                      className="h-full w-full object-cover"
                      draggable="false"
                    />
                  </div>
                </div>
                <h4 className="text-sm text-[#2A282A] font-oxanium uppercase transition-colors group-hover:text-[#9b87f5] w-36 break-words line-clamp-2">
                  {item[textKey]}
                </h4>
              </div>
            ))}
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
        <div ref={imageRef} className="w-full">
          <img 
            src={combinedData?.image} 
            alt={combinedData?.question} 
            className="w-full object-cover" 
            style={{ 
              aspectRatio: "1/1",
              maxHeight: "100vh" 
            }} 
          />
        </div>

        <div className="relative -mt-6">
          <div className="p-6 bg-[#E9E7E2] rounded-t-2xl">
            <h2 className="text-2xl font-baskerville mb-6 text-[#2A282A]">
              {combinedData?.question}
            </h2>
            
            {isEnhancedDataLoading ? (
              <div className="h-20 bg-gray-200 animate-pulse rounded mb-8"></div>
            ) : combinedData?.great_conversation ? (
              <div className="mb-8">
                <p className="text-gray-800 font-baskerville text-lg">
                  {formatText(combinedData.great_conversation)}
                </p>
              </div>
            ) : (
              <p className="text-gray-800 font-baskerville text-lg mb-8 italic">
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
