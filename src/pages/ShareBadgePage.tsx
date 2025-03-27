
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hexagon } from "lucide-react";
import { getStageName } from "@/components/reader/MasteryScore";
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
            title: data.title || "Philosophy Badge",
            subtitle: data.one_sentence || "Knowledge Mastery",
            summary: data.summary || "",
            score: parseInt(data.score) || 6,
            image: data.image_url || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
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
  
  // Domain background colors
  const domainColors: {[key: string]: string} = {
    ethics: "#3D3D6F",
    theology: "#3D3D6F",
    epistemology: "#3D3D6F",
    ontology: "#3D3D6F",
    politics: "#3D3D6F",
    aesthetics: "#3D3D6F",
    default: "#3D3D6F"
  };
  
  const domainColor = domainColors[domainId || "default"];
  
  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Hero section with badge image as background */}
      <div className="relative w-full h-[70vh]">
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37069L8.08261 9.13789C7.54305 8.43882 6.7672 8 5.9 8C4.2431 8 3 9.34315 3 11C3 12.6569 4.2431 14 5.9 14C6.7672 14 7.54305 13.5612 8.08261 12.8621L15.0227 16.6293C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.1328 14 16.357 14.4388 15.8174 15.1379L8.87733 11.3707C8.89227 11.2492 8.9 11.1255 8.9 11C8.9 10.8745 8.89227 10.7508 8.87733 10.6293L15.8174 6.86211C16.357 7.56118 17.1328 8 18 8Z" fill="#E9E7E2"/>
          </svg>
        </Button>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 w-full px-6 pb-32 z-10">
          <h1 className="text-4xl font-serif text-[#E9E7E2] mb-4">{badgeData.title}</h1>
        </div>
      </div>
      
      {/* User badge section */}
      <div className="w-full px-6 py-8 flex flex-col items-center -mt-16 relative z-10">
        <div className="relative h-24 w-24 mb-4">
          <Hexagon 
            className="h-24 w-24" 
            fill="black"
            stroke="#CCFF23"
            strokeWidth={1}
          />
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ 
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          >
            <img 
              src={user?.Account?.ProfilePic || "/lovable-uploads/4471ea2d-9220-4c72-b8a0-893f88abb6a5.png"} 
              alt="User"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif text-center">{fullName}</h2>
        <p className="text-xl font-oxanium text-[#E9E7E2] uppercase mt-2">
          {getStageName(badgeData.score || 6)}
        </p>
        
        {/* Badge summary */}
        <div className="max-w-lg mt-8 text-center px-4">
          <p className="text-base font-oxanium text-[#E9E7E2]/80 leading-relaxed">
            {badgeData.summary ? `"${badgeData.summary}"` : 
              `"Created novel framework for modern problems. Extended concepts into unexplored domains. Synthesized with contemporary critique. Reimagined authenticity through original metaphorical language. Constructed a unique methodology bridging traditions."`}
          </p>
        </div>
      </div>
      
      {/* Footer section */}
      <div className="mt-auto w-full px-6 py-8 flex flex-col items-center">
        <a 
          href="/intellectual-dna-exam" 
          className="font-oxanium uppercase text-base font-bold text-[#E9E7E2] hover:text-[#CCFF23] transition-colors mb-2"
        >
          DISCOVER YOUR INTELLECTUAL DNA
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
