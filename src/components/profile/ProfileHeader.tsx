import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Share, Pen, Calendar } from "lucide-react";
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

  const handleProfileEditClick = () => {
    navigate('/profile/edit');
  };
  
  const handleShareClick = async () => {
    try {
      // Update to use the full_name for the URL with hyphen formatting
      const shareUrl = `${window.location.origin}/profile/share/${fullName.replace(/\s+/g, '-')}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Profile link copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy profile link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative z-10 stacking-context">
      <div className="w-full h-64 bg-[#2A282A] relative">
        {landscapeImage && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${landscapeImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: "0.5"
            }}
          ></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A282A]/0 via-[#2A282A]/70 to-[#2A282A]"></div>
      </div>
      
      <div 
        className="absolute left-0 w-full text-[#E9E7E2]" 
        style={{ 
          bottom: "-40px", 
          zIndex: 30,
          transform: "translateZ(0)",
          paddingBottom: "2rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem"
        }}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col items-start max-w-[60%]">
            <div className="relative h-20 w-20 mb-2">
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
                  <AvatarImage src={profileImage || ""} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <button 
                onClick={handleProfileEditClick}
                className="absolute -bottom-0 -right-1 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                aria-label="Edit profile picture"
              >
                <Pen size={12} className="text-gray-700" />
              </button>
            </div>
            
            <div className="flex items-center justify-between w-full mt-2">
              <div className="w-full">
                <h1 
                  className="text-sm font-libre-baskerville text-[#E9E7E2]/70 italic" 
                  style={{ 
                    position: "relative",
                    zIndex: 50
                  }}
                >
                  {firstName} {lastName}
                </h1>
                <p 
                  className="text-xl font-libre-baskerville font-bold text-[#E9E7E2] whitespace-nowrap"
                  style={{ 
                    position: "relative",
                    zIndex: 50,
                    maxWidth: "100%"
                  }}
                >
                  {archetype}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end self-start">
            <Button 
              variant="ghost" 
              onClick={handleShareClick}
              className="bg-[#263934] text-[#E9E7E2] uppercase font-oxanium text-xs rounded-2xl px-4 py-2 hover:bg-[#263934]/90 transition-colors flex items-center justify-center gap-2 z-10 w-full"
              aria-label="Share profile"
            >
              SHARE PROFILE
              <Share className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/book-counselor')}
              className="bg-[#373763] text-[#E9E7E2] uppercase font-oxanium text-xs rounded-2xl px-4 py-2 hover:bg-[#373763]/90 transition-colors flex items-center justify-center gap-2 z-10 mt-2 w-full"
              aria-label="Book a human"
            >
              BOOK A HUMAN
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
