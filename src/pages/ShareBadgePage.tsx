
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hexagon } from "lucide-react";
import { getHexagonColor, getStageName } from "@/components/reader/MasteryScore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const ShareBadgePage: React.FC = () => {
  const { domainId, resourceId } = useParams<{ domainId: string; resourceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string>("");
  
  // Get the resource from the location state
  const resource = location.state?.resource || {
    id: resourceId,
    title: "Philosophy Badge",
    subtitle: "Knowledge Mastery",
    score: 3,
    image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
  };
  
  // Domains mapping for background colors
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
  
  useEffect(() => {
    // Generate share URL when component mounts
    const currentUrl = window.location.origin;
    const badgeShareUrl = `${currentUrl}/badge/${domainId}/${resourceId}`;
    setShareUrl(badgeShareUrl);
  }, [domainId, resourceId]);
  
  const handleClose = () => {
    navigate("/intellectual-dna-exam");
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${resource.title} Badge`,
          text: `Check out my ${resource.title} badge from Lightning Inspiration!`,
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
  
  // Get user's name for display
  const fullName = user?.Account?.Name || "Philosophy Student";
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ').slice(1).join(' ');
  const initials = `${firstName[0]}${lastName[0] || ""}`;
  
  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Header with background color based on domain */}
      <div className="relative w-full h-64" style={{ backgroundColor: domainColor }}>
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
          <Share2 className="h-6 w-6 text-[#E9E7E2]" />
        </Button>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A282A]/0 via-[#2A282A]/70 to-[#2A282A]"></div>
        
        {/* Badge and user content centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-10">
          {/* Badge hexagon */}
          <div className="relative h-24 w-24 mb-5">
            <Hexagon 
              className="h-24 w-24" 
              fill={getHexagonColor(resource.score || 1)}
              stroke="#CCFF23"
              strokeWidth={1}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-black">
                {resource.score || 1}
              </span>
            </div>
          </div>
          
          {/* Badge name and stage */}
          <h1 className="text-2xl font-serif text-center mb-1">{resource.title}</h1>
          <p className="text-base font-oxanium text-[#E9E7E2]/70 text-center">
            {getStageName(resource.score || 1)}
          </p>
        </div>
      </div>
      
      {/* User profile section */}
      <div className="w-full px-6 py-8 flex flex-col items-center">
        {/* Profile image in hexagon */}
        <div className="relative h-16 w-16 mb-2">
          <svg 
            viewBox="0 0 100 100" 
            className="absolute inset-0 h-full w-full text-[#CCFF23]"
          >
            <polygon 
              points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
            />
          </svg>
          
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            }}
          >
            <Avatar className="h-full w-full overflow-hidden rounded-none">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* User name */}
        <h2 className="text-xl font-serif text-center">{fullName}</h2>
        
        {/* Badge description */}
        <div className="max-w-lg mt-8 text-center">
          <p className="text-sm font-oxanium text-[#E9E7E2]/70 mb-2">
            Earned this badge in
          </p>
          <p className="text-xl font-oxanium text-[#E9E7E2] uppercase">
            {domainId?.charAt(0).toUpperCase() + domainId?.slice(1) || "Philosophy"}
          </p>
          <p className="text-sm font-oxanium text-[#E9E7E2]/50 mt-6">
            {resource.subtitle}
          </p>
        </div>
      </div>
      
      {/* Footer links */}
      <div className="mt-auto w-full px-6 py-8 flex flex-col items-center">
        <a 
          href="/intellectual-dna-exam" 
          className="font-oxanium uppercase text-base font-bold text-[#E9E7E2] hover:text-[#CCFF23] transition-colors mb-2"
        >
          EARN YOUR OWN BADGES
        </a>
        <a 
          href="https://www.lightninginspiration.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="justify-center font-oxanium uppercase text-sm text-[#E9E7E2]/50 hover:text-[#E9E7E2] transition-colors"
        >
          www.lightninginspiration.com
        </a>
      </div>
    </div>
  );
};

export default ShareBadgePage;
