import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Share, Settings, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const { profileData, dnaAnalysisData, isLoading } = useProfileData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const fullName = profileData?.full_name || user?.user_metadata?.full_name || "";
  const firstName = fullName ? fullName.split(' ')[0] : "";
  const lastName = fullName ? fullName.split(' ').slice(1).join(' ') : "";
  const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : "";
  
  const archetype = dnaAnalysisData?.archetype || "";

  // No default landscape image - if there's none, don't show one
  const landscapeImage = profileData?.landscape_image || null;
  const profileImage = profileData?.profile_image || null;
  
  // Lightning logo fallback image
  const FALLBACK_ICON = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQzNjI4OTkwLCJleHAiOjg2NTc0MzU0MjU5MH0.iC8ooiUUENlvy-6ZtRexi_3jIJS5lBy2Y5FnUM82p9o";

  const handleProfileEditClick = () => {
    navigate('/profile/settings');
  };
  
  const handleShareClick = () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }
    
    // Generate a vanity URL format without relying on the database column
    const userIdSuffix = user.id.substring(0, 4);
    const formattedName = fullName.replace(/\s+/g, '-');
    console.log("Generated vanity URL for sharing:", `${formattedName}-${userIdSuffix}`);
    
    // Navigate to the share page - sharing will happen automatically in the ShareableProfile component
    navigate(`/profile/share/${formattedName}-${userIdSuffix}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative z-10 stacking-context">
      {/* Settings button at top right of screen */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          onClick={handleProfileEditClick}
          className="h-10 w-10 rounded-full bg-transparent p-0 hover:bg-transparent"
          aria-label="Edit profile settings"
        >
          <Settings className="h-6 w-6 text-[#E9E7E2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
        </Button>
      </div>

      {/* Landscape image section */}
      <div className="w-full h-[330px] bg-[#2A282A] relative">
        {landscapeImage && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${landscapeImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        )}
      </div>
      
      {/* Share Profile button positioned to align with profile image */}
      <div className="absolute right-6 z-40" style={{ top: "280px", transform: "translateY(-50%)" }}>
        <Button 
          variant="ghost" 
          onClick={handleShareClick}
          className="bg-[#263934] text-[#E9E7E2]/80 uppercase font-oxanium text-xs rounded-2xl px-3 py-1 h-7 hover:bg-[#263934]/90 transition-colors flex items-center justify-center z-10 w-full shadow-[0_0_0_1px_rgba(233,231,226,0.1)]"
          aria-label="Share profile"
        >
          SHARE PROFILE
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={() => navigate('/book-counselor')}
          className="bg-[#301630] text-[#E9E7E2]/80 uppercase font-oxanium text-xs rounded-2xl px-3 py-1 h-7 hover:bg-[#301630]/90 transition-colors flex items-center justify-center z-10 mt-2 w-full shadow-[0_0_0_1px_rgba(233,231,226,0.1)]"
          aria-label="Book a human"
        >
          BOOK A HUMAN
        </Button>
      </div>
      
      {/* Content container */}
      <div 
        className="absolute left-0 w-full text-[#E9E7E2] bg-[#2A282A]" 
        style={{ 
          top: "280px",
          zIndex: 30,
          transform: "translateZ(0)",
          paddingTop: "40px", /* Added padding-top to make room for the hexagon that will overlap */
          paddingBottom: "1rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <div className="flex justify-between w-full relative">
          {/* Empty div to maintain layout - buttons moved to landscape image */}
          <div></div>
        </div>
      </div>

      {/* Hexagon profile with name/archetype - positioned to align with the transition but moved further down */}
      <div className="absolute z-40" style={{ top: "310px", left: "1.5rem", transform: "translateY(-50%)" }}>
        <div className="flex flex-col items-start">
          {/* Hexagon profile image with gradient border */}
          <div className="relative h-28 w-28 p-0.5">
            {/* Original SVG outline */}
            <svg 
              viewBox="-5 -5 110 110" 
              className="absolute inset-0 h-full w-full text-[#CCFF23]"
              preserveAspectRatio="xMidYMid meet"
            >
              <polygon 
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="5"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Gradient border container */}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-[#CCFF23]"
              style={{ 
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              }}
            >
              {/* Inner profile image container - slightly smaller to create border effect */}
              <div 
                className="absolute inset-[3px] overflow-hidden"
                style={{ 
                  clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                }}
              >
                <Avatar className="h-full w-full overflow-hidden rounded-none">
                  <AvatarImage src={profileImage || FALLBACK_ICON} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
          
          {/* Name and archetype below hexagon */}
          <div className="text-left mt-2">
            <h1 
              className="text-base font-libre-baskerville text-[#E9E7E2]/70 italic" 
            >
              {firstName} {lastName}
            </h1>
            <p 
              className="text-lg font-libre-baskerville font-bold text-[#E9E7E2] whitespace-nowrap"
            >
              {archetype}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
