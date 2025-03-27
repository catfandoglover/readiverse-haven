
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { X, Share2, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStageName, getHexagonColor } from "@/components/reader/MasteryScore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPreviousPage } from "@/utils/navigationHistory";

interface BadgeData {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  score: number;
  image: string;
  domainId?: string;
}

const ShareBadgePage: React.FC = () => {
  const { domainId, resourceId } = useParams<{ domainId: string; resourceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string>("");
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use resource from location state if available, otherwise fetch it
  const initialResource = location.state?.resource;
  
  useEffect(() => {
    const fetchBadgeData = async () => {
      if (initialResource) {
        // Use the data passed from navigation
        setBadgeData(initialResource);
        setIsLoading(false);
        return;
      }
      
      if (!resourceId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to get badge data from user_badges table
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .eq('entry_text', resourceId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching badge:", error);
          toast({
            title: "Error loading badge",
            description: "Could not load badge details",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setBadgeData({
            id: resourceId,
            title: data.one_sentence || "Philosophy Badge",
            subtitle: data.one_sentence || "Knowledge Mastery",
            summary: data.summary || "",
            score: parseInt(data.score) || 6,
            image: data.entry_icon || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
            domainId: domainId
          });
        } else {
          // Fallback to default data
          setBadgeData({
            id: resourceId,
            title: "Philosophy Badge",
            subtitle: "Knowledge Mastery",
            score: 6,
            image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
            domainId: domainId
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadgeData();
  }, [resourceId, initialResource, domainId, toast]);
  
  useEffect(() => {
    const currentUrl = window.location.origin;
    const badgeShareUrl = `${currentUrl}/badge/${domainId}/${resourceId}`;
    setShareUrl(badgeShareUrl);
  }, [domainId, resourceId]);
  
  const handleClose = () => {
    const previousPage = getPreviousPage();
    // Navigate back to the previous page or to index if there's no valid previous page
    navigate(previousPage || "/index");
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${badgeData?.title || 'Philosophy'} Badge`,
          text: `Check out my ${badgeData?.title || 'Philosophy'} badge from Lightning Inspiration!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Badge share link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing failed",
        description: "Unable to share or copy link",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2A282A]">
        <div className="text-[#E9E7E2]">Loading badge...</div>
      </div>
    );
  }
  
  if (!badgeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2A282A]">
        <div className="text-[#E9E7E2]">Badge not found</div>
      </div>
    );
  }
  
  const fullName = user?.Account?.Name || "Philosophy Student";
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ').slice(1).join(' ');
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  
  // Get the badge level color
  const badgeColor = getHexagonColor(badgeData.score);
  
  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      {/* Hero section with badge image as background - slightly reduced height */}
      <div className="relative w-full h-[45vh]">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={badgeData.image} 
            alt={badgeData.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-[#2A282A]"></div>
        
        {/* Close button */}
        <Button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-[#2A282A]/50 p-0 hover:bg-[#2A282A]/70"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-[#E9E7E2]" />
        </Button>
        
        {/* Share button */}
        <Button 
          onClick={handleShare}
          className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bg-[#2A282A]/50 p-0 hover:bg-[#2A282A]/70"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5 text-[#E9E7E2]" />
        </Button>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 w-full px-6 z-10">
          <h1 className="text-3xl font-serif text-[#E9E7E2] mb-2">{badgeData.title}</h1>
        </div>
      </div>
      
      {/* User badge section - moved up to overlap with hero */}
      <div className="w-full px-6 py-4 flex flex-col items-center -mt-20 relative z-10">
        <div className="relative h-24 w-24 mb-2">
          {/* Colored hexagon instead of avatar */}
          <svg 
            viewBox="0 0 24 24" 
            height="100%" 
            width="100%" 
            xmlns="http://www.w3.org/2000/svg" 
            fill={badgeColor}
            stroke="#CCFF23"
            strokeWidth="1"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m21 16.2-9 5.1-9-5.1V7.8l9-5.1 9 5.1v8.4Z"></path>
          </svg>
          
          {/* Badge level number */}
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-black">
            {badgeData.score}
          </span>
        </div>
        
        <h2 className="text-2xl font-serif text-center mt-4">{fullName}</h2>
        <p className="text-lg font-oxanium text-[#E9E7E2] uppercase mt-1">
          {getStageName(badgeData.score || 6)}
        </p>
        
        {/* Badge summary - increased text size */}
        <div className="max-w-lg mt-5 text-center px-4">
          <p className="text-base font-oxanium text-[#E9E7E2]/90 leading-relaxed">
            {badgeData.summary ? `"${badgeData.summary}"` : 
              `"Created novel framework for modern problems. Extended concepts into unexplored domains."`}
          </p>
        </div>
      </div>
      
      {/* Footer section - moved up */}
      <div className="mt-auto w-full px-6 py-6 flex flex-col items-center">
        <a 
          href="/https://www.lightninginspiration.com" 
          className="font-oxanium uppercase text-base font-bold text-[#E9E7E2] hover:text-[#CCFF23] transition-colors mb-1"
        >
          BECOME WHO YOU ARE
        </a>
        <a 
          href="https://www.lightninginspiration.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="justify-center font-oxanium uppercase text-sm text-[#E9E7E2]/50 hover:text-[#E9E7E2] transition-colors"
        >
          WWW.LIGHTNINGINSPIRATION.COM
        </a>
      </div>
    </div>
  );
};

export default ShareBadgePage;
