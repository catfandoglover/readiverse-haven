
import React, { useState } from "react";
import { ArrowUp, ArrowDown, Share, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useBookshelfManager } from "@/hooks/useBookshelfManager";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import VirgilChatButton from "./VirgilChatButton";

interface ContentCardProps {
  image: string;
  title: string;
  about: string;
  itemId?: string;
  itemType?: "classic" | "icon" | "concept";
  onLearnMore: () => void;
  onImageClick: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  image,
  title,
  about,
  itemId,
  itemType = "classic",
  onLearnMore,
  onImageClick,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, openLogin } = useAuth();
  const { addToBookshelf } = useBookshelfManager();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (user && itemId && itemType) {
      const checkFavoriteStatus = async () => {
        try {
          const { data } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('item_id', itemId)
            .eq('outseta_user_id', user.Uid)
            .eq('item_type', itemType)
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
  }, [user, itemId, itemType]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      openLogin();
      return;
    }
    
    if (!itemId || !itemType) {
      console.error("Missing itemId or itemType for favorite operation");
      return;
    }
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('item_id', itemId)
          .eq('outseta_user_id', user.Uid)
          .eq('item_type', itemType);
          
        if (error) throw error;
        
        setIsFavorite(false);
        toast({
          description: `${itemType === 'classic' ? 'Book' : itemType} removed from favorites`,
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            item_id: itemId,
            outseta_user_id: user.Uid,
            item_type: itemType,
            added_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setIsFavorite(true);
        toast({
          description: `${itemType === 'classic' ? 'Book' : itemType} added to favorites`,
        });
        
        if (itemType === 'classic') {
          addToBookshelf.mutate(itemId);
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

  const formatText = (text: string) => {
    if (!text) return "";
    return text.split("\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full relative">
        <div 
          className="relative aspect-square w-full" 
          onClick={onImageClick}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-4 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col rounded-t-3xl -mt-24 relative z-10">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-libre-baskerville font-bold max-w-[70%]">{title}</h2>
              <div className="flex gap-2 items-center shrink-0">
                {itemId && (
                  <VirgilChatButton
                    contentTitle={title}
                    contentId={itemId}
                    contentType={itemType}
                    className="text-[#2A282A]"
                  />
                )}
                <button
                  className="flex items-center justify-center text-[#2A282A]"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={toggleFavorite}
                >
                  <Star 
                    className="h-6 w-6" 
                    fill={isFavorite ? "#EFFE91" : "#E9E7E2"} 
                  />
                </button>
                <button
                  className="flex items-center justify-center text-[#2A282A]"
                  aria-label="Share"
                >
                  <Share className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-800 font-baskerville text-lg">{formatText(about)}</p>
          </div>
          
          <div className="py-1 flex items-center justify-start">
            <button
              className="uppercase tracking-wider flex items-center gap-1 font-oxanium text-[#282828]/50 pl-0 font-bold text-base"
              onClick={onLearnMore}
            >
              <span className="flex items-center">
                LEARN MORE
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#282828]/50 text-[#E9E7E2] ml-3">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-20">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              hasPrevious ? 'bg-[#282828]/50 hover:bg-[#282828]/70' : 'bg-[#282828]/20'
            } text-[#E9E7E2] transition-colors`}
            aria-label="Previous"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              hasNext ? 'bg-[#282828]/50 hover:bg-[#282828]/70' : 'bg-[#282828]/20'
            } text-[#E9E7E2] transition-colors`}
            aria-label="Next"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative bg-[#2A282A] overflow-hidden">
      <div 
        className="w-1/2 h-full cursor-pointer" 
        onClick={onImageClick}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="w-1/2 p-8 bg-[#E9E7E2] text-[#2A282A] flex flex-col">
        <div className="flex-1 pt-[18vh]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-libre-baskerville font-bold max-w-[70%]">{title}</h2>
            <div className="flex gap-3 items-center shrink-0">
              {itemId && (
                <VirgilChatButton
                  contentTitle={title}
                  contentId={itemId}
                  contentType={itemType}
                  className="text-[#2A282A] hover:scale-110 transition-transform"
                />
              )}
              <button
                className="flex items-center justify-center text-[#2A282A] hover:scale-110 transition-transform"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={toggleFavorite}
              >
                <Star 
                  className="h-7 w-7" 
                  fill={isFavorite ? "#EFFE91" : "#E9E7E2"} 
                />
              </button>
              <button
                className="flex items-center justify-center text-[#2A282A] hover:scale-110 transition-transform"
                aria-label="Share"
              >
                <Share className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-800 font-baskerville text-xl leading-relaxed">{formatText(about)}</p>
          </div>
        </div>
        
        <div className="pt-6 mt-auto flex justify-between items-center">
          <button
            className="uppercase tracking-wider flex items-center gap-1 font-oxanium text-[#282828]/70 font-bold text-lg hover:text-[#282828] transition-colors"
            onClick={onLearnMore}
          >
            <span className="flex items-center">
              LEARN MORE
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#282828]/60 text-[#E9E7E2] ml-3 group-hover:bg-[#282828] transition-colors">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                hasPrevious ? 'bg-[#282828]/50 hover:bg-[#282828]/70' : 'bg-[#282828]/20'
              } text-[#E9E7E2] transition-colors`}
              aria-label="Previous"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                hasNext ? 'bg-[#282828]/50 hover:bg-[#282828]/70' : 'bg-[#282828]/20'
              } text-[#E9E7E2] transition-colors`}
              aria-label="Next"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
