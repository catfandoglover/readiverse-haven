
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Share, Pen, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileData {
  id: string;
  outseta_user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  landscape_image?: string;
  profile_image?: string;
}

interface DNAAnalysisResult {
  id: string;
  assessment_id: string;
  archetype: string | null;
  created_at: string;
}

const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

const ProfileHeader: React.FC = () => {
  const { user, openProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [landscapeImage, setLandscapeImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const fullName = profileData?.full_name || user?.Account?.Name || "Explorer";
  const firstName = fullName.split(' ')[0] || "Explorer";
  const lastName = fullName.split(' ').slice(1).join(' ') || "";
  const initials = `${firstName[0]}${lastName[0] || ""}`;
  
  const archetype = analysisResult?.archetype || "Twilight Navigator";

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.Uid) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('outseta_user_id', user.Uid)
            .maybeSingle();
            
          if (data && !error) {
            console.log("Profile data:", data);
            
            const profileData = data as ProfileData;
            setProfileData(profileData);
            
            if (profileData.landscape_image) {
              setLandscapeImage(profileData.landscape_image);
            }
            
            if (profileData.profile_image) {
              setProfileImage(profileData.profile_image);
            }
          } else {
            console.error("Error fetching profile data:", error);
          }
        } catch (e) {
          console.error("Exception fetching profile:", e);
        }
      }
    };
    
    const fetchDNAAnalysisResult = async () => {
      try {
        setIsLoadingAnalysis(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('id, assessment_id, archetype, created_at')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
          .maybeSingle();
          
        if (data && !error) {
          console.log("DNA analysis result:", data);
          setAnalysisResult(data as DNAAnalysisResult);
        } else {
          console.error("Error fetching DNA analysis result:", error);
        }
      } catch (e) {
        console.error("Exception fetching DNA analysis result:", e);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };
    
    fetchProfileData();
    fetchDNAAnalysisResult();
  }, [user]);

  const backgroundImageUrl = landscapeImage || '/lovable-uploads/78b6880f-c65b-4b75-ab6c-8c1c3c45e81d.png';

  const handleProfileEditClick = () => {
    openProfile({ tab: 'profile' });
  };
  
  const handleShareClick = async () => {
    try {
      const shareUrl = window.location.origin + `/profile/share/alex-jakubowski`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${firstName}'s Profile`,
          text: `Check out ${firstName}'s reading profile!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        const shareUrl = window.location.origin + `/profile/share/alex-jakubowski`;
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard",
        });
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        toast({
          title: "Share failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="relative z-10 stacking-context">
      <div className="w-full h-64 bg-[#2A282A] relative">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images//Twilight%20Navigator.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: "0.5"
          }}
        ></div>
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
                  <AvatarImage src={profileImage || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/profile_images//Alex%20Jakubowski.png"} />
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
            
            <div className="flex items-center justify-between w-full">
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
                  className="text-xl font-libre-baskerville font-bold text-[#E9E7E2] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ 
                    position: "relative",
                    zIndex: 50,
                    maxWidth: "100%"
                  }}
                >
                  {isLoadingAnalysis ? 'Loading...' : archetype}
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
};

export default ProfileHeader;
