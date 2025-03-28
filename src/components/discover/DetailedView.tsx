import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, BookOpenText, ChevronDown, Plus, ShoppingCart, Star, Share, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { saveLastVisited, getLastVisited, sections, getPreviousPage, popNavigationHistory, getOriginPath } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useFormatText } from "@/hooks/useFormatText";
import OrderDialog from "./OrderDialog";
import VirgilChatButton from "./VirgilChatButton";
import ClassicActionsMenu from "./ClassicActionsMenu";
import { useNavigationState } from "@/hooks/useNavigationState";

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

interface DetailedViewProps {
  type: "icon" | "concept" | "classic";
  data: any;
  onBack?: () => void;
}

interface OrderDialogProps {
  bookId: string;
  title: string;
  coverUrl: string;
  amazonUrl: string;
  bookshopUrl: string;
  onClose: () => void;
  open: boolean;
}

const DetailedView: React.FC<DetailedViewProps> = ({
  type,
  data: itemData,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openLogin } = useAuth();
  const { getSourcePath, getFeedSourcePath } = useNavigationState();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [readerFilter, setReaderFilter] = useState<"SEEKERS" | "READERS" | "TOP RANKED">(
    type === "icon" ? "SEEKERS" : "READERS"
  );
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const { formatText } = useFormatText();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [combinedData, setCombinedData] = useState<any>(itemData);
  const [shouldBlurHeader, setShouldBlurHeader] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: enhancedData, isLoading: isEnhancedDataLoading } = useQuery({
    queryKey: ["item-details", type, itemData.id],
    queryFn: async () => {
      if (!itemData.id) return null;
      
      const tableName = type === 'classic' ? 'books' : type === 'icon' ? 'icons' : 'concepts';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(type === 'classic' ? '*' : '*')
        .eq('id', itemData.id)
        .single();
      
      if (error) {
        console.error(`Error fetching enhanced ${type} data:`, error);
        return null;
      }
      
      return data;
    },
    staleTime: 60000,
  });

  const { data: greatQuestions = [] } = useQuery({
    queryKey: ["great-questions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("great_questions")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  const { data: concepts = [] } = useQuery({
    queryKey: ["concepts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("concepts")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  const { data: relatedClassics = [] } = useQuery({
    queryKey: ["related-classics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .neq('id', itemData.id)
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

  const { data: readersData = [], isLoading: isReadersLoading } = useQuery({
    queryKey: ["book-readers", itemData.id, readerFilter],
    queryFn: async () => {
      if (!itemData.id) return [];
      
      const { data, error } = await supabase
        .from("user_books")
        .select(`
          outseta_user_id,
          status,
          last_read_at,
          profiles:outseta_user_id(full_name, email)
        `)
        .eq("book_id", itemData.id)
        .order("outseta_user_id", { ascending: true });
      
      if (error) {
        console.error("Error fetching readers:", error);
        return [];
      }
      
      if (readerFilter === "TOP RANKED") {
        return data.sort((a, b) => {
          if (!a.last_read_at) return 1;
          if (!b.last_read_at) return -1;
          return new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime();
        });
      }
      
      return data;
    },
  });

  const { data: authorIconData } = useQuery({
    queryKey: ["author-icon", combinedData?.author_id],
    queryFn: async () => {
      if (!combinedData?.author_id) return null;
      
      const { data, error } = await supabase
        .from("icons")
        .select("*")
        .eq("id", combinedData.author_id)
        .single();
      
      if (error) {
        console.error("Error fetching author icon data:", error);
        return null;
      }
      
      return data;
    },
    enabled: type === "classic" && !!combinedData?.author_id,
  });

  const { data: authorClassics = [] } = useQuery({
    queryKey: ["classics-by-author", itemData.id],
    queryFn: async () => {
      if (type !== "icon" || !itemData.id) return [];
      
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("author_id", itemData.id);
      
      if (error) {
        console.error("Error fetching classics by author:", error);
        return [];
      }
      
      return data;
    },
    enabled: type === "icon",
  });

  useEffect(() => {
    if (!enhancedData && !isEnhancedDataLoading) return;
    
    let imageProperty: { image: string } = { image: itemData.image || '' };
    
    if (type === 'classic') {
      const bookData = enhancedData as { 
        cover_url?: string; 
        Cover_super?: string;
        icon_illustration?: string; 
      } | null;
      
      if (bookData) {
        imageProperty = { 
          image: bookData.cover_url || 
                bookData.Cover_super || 
                bookData.icon_illustration || 
                itemData.image || ''
        };
      }
    } 
    else if (type === 'icon' || type === 'concept') {
      const conceptData = enhancedData as { illustration?: string } | null;
      if (conceptData) {
        imageProperty = { 
          image: conceptData.illustration || itemData.image || ''
        };
      }
    }

    setCombinedData({ 
      ...itemData,
      ...(enhancedData || {}),
      ...imageProperty
    });
  }, [itemData, enhancedData, isEnhancedDataLoading, type]);

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
            .eq('item_type', type)
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
  }, [user, itemData.id, type]);

  const handleBack = () => {
    console.log("[DetailedView] Back button clicked", {
      onBack: !!onBack,
      locationState: location.state,
      pathname: location.pathname
    });
    
    // Priority 1: Use provided onBack callback if available
    if (onBack) {
      console.log("[DetailedView] Using onBack callback");
      onBack();
      return;
    }
    
    // Priority 2: Get source path from location state
    if (location.state?.sourcePath) {
      const sourcePath = location.state.sourcePath;
      console.log("[DetailedView] Navigating to source path from location state:", sourcePath);
      navigate(sourcePath);
      return;
    }
    
    // Priority 3: Use getFeedSourcePath for content viewed from feeds
    // This is CRITICAL to ensure we go back to FOR YOU feed if that's where we came from
    const contentType = location.pathname.split('/view/')[1]?.split('/')[0];
    if (contentType && ['icon', 'classic', 'concept', 'question'].includes(contentType)) {
      const feedPath = getFeedSourcePath();
      if (feedPath) {
        console.log("[DetailedView] Navigating to feed source path:", feedPath);
        navigate(feedPath);
        return;
      }
    }
    
    // Priority 4: Fall back to getSourcePath from navigation state hook
    const sourcePath = getSourcePath();
    if (sourcePath && sourcePath !== location.pathname) {
      console.log("[DetailedView] Navigating to source path from hook:", sourcePath);
      navigate(sourcePath);
      return;
    }
    
    // Priority 5: Use general back navigation as last resort
    if (window.history.length > 1) {
      console.log("[DetailedView] Using window.history.back()");
      window.history.back();
      return;
    }
    
    // Ultimate fallback to For You feed
    console.log("[DetailedView] Fallback to For You feed");
    navigate('/discover');
  };

  const handleReadNow = async () => {
    try {
      if (user && combinedData.id) {
        if (!isFavorite) {
          const { error } = await supabase
            .from('user_favorites')
            .insert({
              item_id: combinedData.id,
              outseta_user_id: user.Uid,
              item_type: type,
              added_at: new Date().toISOString()
            });
            
          if (!error) {
            setIsFavorite(true);
            toast({
              description: `Added to favorites`,
            });
          }
        }
      }
      
      if (combinedData.epub_file_url) {
        navigate(`/read/${combinedData.id}`, { 
          state: { 
            bookUrl: combinedData.epub_file_url,
            metadata: { Cover_super: combinedData.Cover_super || combinedData.cover_url }
          } 
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This book is not available for reading"
        });
      }
    } catch (error) {
      console.error("Error handling read action:", error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again."
      });
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (combinedData?.author_id) {
      console.log("Navigating to author icon page:", combinedData.author_id);
      
      navigate(`/view/icon/${combinedData.author_id}`, { replace: true });
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      console.log("No author_id found for navigation:", combinedData);
      toast({
        description: "Author information unavailable",
        variant: "destructive"
      });
    }
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      const { error } = await supabase
        .from('user_books')
        .insert({
          book_id: combinedData.id,
          outseta_user_id: user.Uid,
          status: 'reading'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Book added to your library"
      });
    } catch (error) {
      console.error("Error adding book to library", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add book to your library"
      });
    }
  };

  const handleOrder = () => {
    setIsOrderDialogOpen(true);
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/view/${type}/${combinedData.id}`;
      const shareTitle = combinedData.title || combinedData.name || "Check this out";
      const shareText = combinedData.introduction || `Check out this ${type === 'classic' ? 'book' : type}!`;
      
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

  const addToBookshelf = async (itemId: string) => {
    if (!user) return;
    
    try {
      const { data: existingBook, error: checkError } = await supabase
        .from('user_books')
        .select('*')
        .eq('book_id', itemId)
        .eq('outseta_user_id', user.Uid)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking bookshelf:", checkError);
        return;
      }
      
      if (!existingBook) {
        const { error } = await supabase
          .from('user_books')
          .insert({
            book_id: itemId,
            outseta_user_id: user.Uid,
            status: 'reading'
          });

        if (error) {
          console.error("Error adding book to bookshelf:", error);
          return;
        }
        
        console.log("Book added to bookshelf:", itemId);
      }
    } catch (error) {
      console.error("Error in add to bookshelf process:", error);
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
          .eq('item_type', type);
          
        if (error) throw error;
        
        setIsFavorite(false);
        toast({
          description: `${type === 'classic' ? 'Book' : type} removed from favorites`,
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            item_id: combinedData.id,
            outseta_user_id: user.Uid,
            item_type: type,
            added_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setIsFavorite(true);
        toast({
          description: `${type === 'classic' ? 'Book' : type} added to favorites`,
        });
        
        if (type === 'classic') {
          await addToBookshelf(combinedData.id);
        }
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
            {combinedData?.title || combinedData?.name || type.toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <VirgilChatButton
            contentTitle={combinedData?.title || combinedData?.name || type}
            contentId={combinedData?.id || ""}
            contentType={type}
            className={cn(
              "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
              shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
            )}
            iconClassName={shouldBlurHeader ? "opacity-90" : "brightness-[1.2]"}
          />
          
          {type === "classic" ? (
            <>
              <button
                className={cn(
                  "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
                  shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
                )}
                aria-label="Read"
                onClick={handleReadNow}
              >
                <BookOpenText className="h-5 w-5" />
              </button>
              <ClassicActionsMenu
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                handleOrder={handleOrder}
                handleShare={handleShare}
                shouldBlurHeader={shouldBlurHeader}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
                <h4 className={cn(
                  "text-sm font-oxanium uppercase group-hover:text-[#9b87f5] transition-colors",
                  "w-36 break-words line-clamp-2",
                  type === "classic" ? "text-white" : "text-[#2A282A]"
                )}>
                  {item[textKey]}
                </h4>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderClassicButtons = () => null;

  const renderIconButtons = () => (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-3xl font-serif">{combinedData.title || combinedData.name}</h2>
    </div>
  );

  const renderAnecdotes = () => {
    if (!combinedData.anecdotes) return null;
    
    let anecdotesArray: string[] = [];
    
    if (typeof combinedData.anecdotes === 'string') {
      try {
        anecdotesArray = JSON.parse(combinedData.anecdotes);
      } catch (e) {
        anecdotesArray = [combinedData.anecdotes];
      }
    } else if (Array.isArray(combinedData.anecdotes)) {
      anecdotesArray = combinedData.anecdotes;
    }
    
    if (anecdotesArray.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-2xl font-oxanium mb-4 text-[#2A282A] uppercase">ANECDOTES</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-800 font-baskerville text-lg">
          {anecdotesArray.map((anecdote, index) => (
            <li key={index}>{formatText(anecdote)}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderGreatConversation = () => {
    if (!combinedData.great_conversation) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-2xl font-oxanium mb-4 text-[#2A282A] uppercase">THE GREAT CONVERSATION</h3>
        <p className="text-gray-800 font-baskerville text-lg">
          {formatText(combinedData.great_conversation)}
        </p>
      </div>
    );
  };

  const renderAuthorField = () => {
    if (type !== "classic") return null;
    
    return (
      <h2 className="text-xl font-baskerville mb-6 text-[#2A282A]/70">
        by {combinedData?.author_id ? (
          <button 
            onClick={handleAuthorClick}
            className="inline-flex items-center relative hover:text-[#9b87f5] transition-colors"
          >
            <span className="relative">
              {combinedData.author}
              <span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9b87f5] transform origin-bottom-left scale-x-0 transition-transform duration-300"
              />
            </span>
            <style>
              {`
              button:hover span span {
                transform: scaleX(1);
              }
            `}
            </style>
          </button>
        ) : (
          combinedData?.author
        )}
      </h2>
    );
  };

  const renderClassicsByIcon = () => {
    if (type !== "icon" || authorClassics.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-2xl font-oxanium mb-4 text-[#2A282A] uppercase">
          CLASSICS FROM {combinedData.name?.toUpperCase()}
        </h3>
        <ScrollArea className="w-full pb-4" enableDragging orientation="horizontal">
          <div className="flex space-x-4 min-w-max px-0.5 py-0.5">
            {authorClassics.map((classic) => (
              <div
                key={classic.id}
                className="relative flex-none cursor-pointer group"
                onClick={() => handleCarouselItemClick(classic, "classic")}
              >
                <div className="h-36 w-36 rounded-lg overflow-hidden mb-2">
                  <div className="absolute inset-0 bg-[#2A282A]"></div>
                  <div className="relative h-full w-full overflow-hidden rounded-[0.4rem]">
                    <img
                      src={classic.cover_url || classic.Cover_super || ''}
                      alt={classic.title || ""}
                      className="h-full w-full object-cover"
                      draggable="false"
                    />
                  </div>
                </div>
                <h4 className="text-sm text-[#2A282A] font-oxanium uppercase line-clamp-2 transition-colors group-hover:text-[#9b87f5]">
                  {classic.title}
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
            alt={combinedData?.title || combinedData?.name} 
            className="w-full object-cover" 
            style={{ 
              aspectRatio: "1/1",
              maxHeight: "100vh",
              ...(type === "classic" ? {
                objectPosition: "center -5vh"
              } : {})
            }} 
          />
        </div>

        <div className="relative -mt-6">
          <div className="p-6 bg-[#E9E7E2] rounded-t-2xl">
            {type !== "classic" && renderIconButtons()}
            
            {renderAuthorField()}
            
            {isEnhancedDataLoading ? (
              <div className="h-20 bg-gray-200 animate-pulse rounded mb-8"></div>
            ) : combinedData?.introduction ? (
              <p className="text-gray-800 font-baskerville text-lg mb-8">
                {formatText(combinedData.introduction)}
              </p>
            ) : (
              <p className="text-gray-800 font-baskerville text-lg mb-8 italic">
                Introduction content will appear here when available.
              </p>
            )}

            {type === "icon" && renderAnecdotes()}
            
            {type === "icon" && renderClassicsByIcon()}
            
            {type === "icon" && renderGreatConversation()}

            {isEnhancedDataLoading ? (
              <div className="mb-8">
                <h3 className="text-2xl font-oxanium mb-4 text-[#2A282A] uppercase">THE GREAT CONVERSATION</h3>
                <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : combinedData.great_question_connection ? (
              <div className="mb-8">
                <h3 className="text-2xl font-oxanium mb-4 text-[#2A282A] uppercase">THE GREAT CONVERSATION</h3>
                <p className="text-gray-800 font-baskerville text-lg">
                  {formatText(combinedData.great_question_connection)}
                </p>
              </div>
            ) : null}

            {renderHorizontalSlider("GREAT QUESTIONS", greatQuestions, "illustration", "question", "question")}
            
            {renderHorizontalSlider("MAJOR THEMES", concepts, "illustration", "title", "concept")}
            
            {renderHorizontalSlider("CONNECTED ICONS", connectedIcons, "illustration", "name", "icon")}
            
            {renderHorizontalSlider("RELATED CLASSICS", relatedClassics, "cover_url", "title", "classic")}
            
            <div className="h-32"></div>
          </div>
        </div>
      </div>
      
      {isOrderDialogOpen && (
        <OrderDialog
          title={combinedData?.title}
          amazonLink={combinedData?.amazon_link}
          open={isOrderDialogOpen}
          onOpenChange={() => setIsOrderDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default DetailedView;
