import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Share, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStageName, getHexagonColor } from "@/components/reader/MasteryScore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPreviousPage } from "@/utils/navigationHistory";

// Helper function to get roman numeral
const getRomanNumeral = (level: number): string => {
  switch(level) {
    case 1: return "I";
    case 2: return "II";
    case 3: return "III";
    case 4: return "IV";
    case 5: return "V";
    case 6: return "VI";
    default: return "I";
  }
};

interface BadgeData {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  score: number;
  image: string;
  domainId?: string;
  resourceType?: "icon" | "concept" | "classic";
  userId?: string;
}

interface ShareBadgeParams {
  domainId: string;
  resourceId: string;
  userName?: string;
}

const ShareBadgePage: React.FC = () => {
  const params = useParams<Record<string, string>>();
  const { domainId, resourceId, userName } = params;
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string>("");
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resourceType, setResourceType] = useState<"icon" | "concept" | "classic" | null>(null);
  const [fullName, setFullName] = useState<string>("Philosophy Student");
  const [isOwnBadge, setIsOwnBadge] = useState<boolean>(false);
  
  // Use resource from location state if available, otherwise fetch it
  const initialResource = location.state?.resource;
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // Get user's profile data
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Error fetching profile:", error);
          } else if (data && data.full_name) {
            setFullName(data.full_name);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  useEffect(() => {
    const fetchBadgeData = async () => {
      if (initialResource) {
        // Use the data passed from navigation
        setBadgeData(initialResource);
        setResourceType(initialResource.resourceType || null);
        
        // Check if this badge belongs to the current user
        if (user && initialResource.userId === user.id) {
          setIsOwnBadge(true);
        }
        
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
          // Determine resource type based on badge data
          let type: "icon" | "concept" | "classic" | null = null;
          
          if (data.entry_icon) {
            type = "icon";
          } else if (data.entry_concepts) {
            type = "concept";
          } else {
            // Try to determine type by checking different tables
            const promises = [
              supabase.from('icons').select('id').eq('id', resourceId).maybeSingle(),
              supabase.from('concepts').select('id').eq('id', resourceId).maybeSingle(),
              supabase.from('books').select('id').eq('id', resourceId).maybeSingle()
            ];
            
            const [iconResult, conceptResult, classicResult] = await Promise.all(promises);
            
            if (iconResult.data) {
              type = "icon";
            } else if (conceptResult.data) {
              type = "concept";
            } else if (classicResult.data) {
              type = "classic";
            }
          }
          
          setResourceType(type);
          
          // Determine image field based on resource type
          let imageField = data.entry_icon || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";
          if (type === "classic") {
            // Use a type assertion to handle possible missing properties
            const extendedData = data as any;
            imageField = extendedData.entry_icon_illustration || data.entry_icon || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";
          } else {
            // Use a type assertion to handle possible missing properties
            const extendedData = data as any;
            imageField = extendedData.entry_illustration || data.entry_icon || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";
          }
          
          // Check if this badge belongs to the current user
          if (user && data.userid === user.id) {
            setIsOwnBadge(true);
          }
          
          setBadgeData({
            id: resourceId,
            title: data.one_sentence || "Philosophy Badge",
            subtitle: data.one_sentence || "Knowledge Mastery",
            summary: data.summary || "",
            score: parseInt(data.score) || 6,
            image: imageField,
            domainId: domainId,
            resourceType: type,
            userId: data.userid
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
  }, [resourceId, initialResource, domainId, toast, user]);
  
  useEffect(() => {
    const currentUrl = window.location.origin;
    // Include the user's name in the share URL for uniqueness
    const userNameSegment = userName ? `/${userName}` : '';
    const badgeShareUrl = `${currentUrl}/badge/${domainId}/${resourceId}${userNameSegment}`;
    setShareUrl(badgeShareUrl);
  }, [domainId, resourceId, userName]);
  
  const handleClose = () => {
    // Always navigate to /dna when X is clicked
    navigate('/dna');
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
  
  const badgeColor = getHexagonColor(badgeData.score);
  
  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      {/* Hero section with badge image as background - takes full height minus content section */}
      <div className="relative w-full h-1/2">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={badgeData.image} 
            alt={badgeData.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header overlay - positioned absolutely on top of the image */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center px-4 z-20">
          {/* Back button */}
          <div className="absolute left-4">
            <Button 
              onClick={handleClose}
              className="h-10 w-10 rounded-full bg-transparent p-0 hover:bg-transparent"
              aria-label="Back"
            >
              <ArrowLeft className="h-7 w-7 text-[#E9E7E2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] stroke-[1.5]" />
            </Button>
          </div>
          
          {/* Header title - student name with enhanced visibility */}
          <h1 className="font-oxanium uppercase font-bold text-sm tracking-wider text-[#E9E7E2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {fullName}
          </h1>
          
          {/* Share button - always in top right */}
          <div className="absolute right-4">
            <Button 
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-transparent p-0 hover:bg-transparent"
              aria-label="Share"
            >
              <Share className="h-7 w-7 text-[#E9E7E2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] stroke-[1.5]" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content container - takes up the rest of the screen */}
      <div className="relative flex-1 bg-[#2A282A] flex flex-col items-center z-10">
        {/* Badge hexagon - positioned to overlap equally and centered horizontally */}
        <div className="absolute -top-[80px] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="relative" style={{ height: '160px', width: '160px' }}>
            <svg 
              viewBox="0 0 24 24" 
              height="100%" 
              width="100%" 
              xmlns="http://www.w3.org/2000/svg" 
              fill={badgeColor}
              stroke="#E9E7E2"
              strokeWidth="0.5"
            >
              <path d="M21 16.05V7.95C20.9988 7.6834 20.9344 7.4209 20.811 7.18465C20.6875 6.94841 20.5088 6.74591 20.29 6.6L12.71 2.05C12.4903 1.90551 12.2376 1.82883 11.98 1.82883C11.7224 1.82883 11.4697 1.90551 11.25 2.05L3.67 6.6C3.45124 6.74591 3.27248 6.94841 3.14903 7.18465C3.02558 7.4209 2.96118 7.6834 2.96 7.95V16.05C2.96118 16.3166 3.02558 16.5791 3.14903 16.8153C3.27248 17.0516 3.45124 17.2541 3.67 17.4L11.25 21.95C11.4697 22.0945 11.7224 22.1712 11.98 22.1712C12.2376 22.1712 12.4903 22.0945 12.71 21.95L20.29 17.4C20.5088 17.2541 20.6875 17.0516 20.811 16.8153C20.9344 16.5791 20.9988 16.3166 21 16.05Z"></path>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-libre-baskerville font-bold text-4xl" style={{ color: badgeData.score === 6 ? "#FFFFFF" : "#3D3D6F" }}>
              {getRomanNumeral(badgeData.score)}
            </span>
          </div>
          
          {/* Badge level name */}
          <p className="text-center font-libre-baskerville italic text-base mt-2" style={{ color: badgeColor }}>
            {getStageName(badgeData.score || 6)}
          </p>
        </div>
        
        {/* Badge title - increased text size */}
        <h1 className="font-libre-baskerville font-bold text-lg mt-32 mb-6 text-center">
          {badgeData.title}
        </h1>
        
        {/* Badge summary - smaller size, no quotes, centered in the available space */}
        <div className="max-w-lg flex-1 flex items-center justify-center px-6">
          <p className="text-sm font-oxanium text-[#E9E7E2]/90 leading-relaxed text-center">
            {badgeData.summary || 
              "Created novel framework for modern problems. Extended concepts into unexplored domains."}
          </p>
        </div>
        
        {/* Footer section */}
        <div className="w-full px-6 py-4 flex flex-col items-center">
          <a 
            href="https://www.lightninginspiration.com" 
            className="font-oxanium uppercase text-sm font-bold text-[#E9E7E2] hover:text-[#CCFF23] transition-colors mb-1"
          >
            BECOME WHO YOU ARE
          </a>
          <a 
            href="https://www.lightninginspiration.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="justify-center font-oxanium uppercase text-xs text-[#E9E7E2]/50 hover:text-[#E9E7E2] transition-colors"
          >
            WWW.LIGHTNINGINSPIRATION.COM
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareBadgePage;
