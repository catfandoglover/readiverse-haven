
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Share, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  introduction: string | null;
  created_at: string;
}

const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

// FUTURE EDIT POINT: Remove this default profile when the real profile fetching is fixed
// ---------------------------------------------------------------------------------
const DEFAULT_PROFILE: ProfileData = {
  id: "default-id",
  outseta_user_id: "default-outseta-id",
  email: "alex@midwestlfg.com",
  full_name: "Alex Jakubowski",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  profile_image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/profile_images//Alex%20Jakubowski.png",
  landscape_image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images//Twilight%20Navigator.png"
};

const DEFAULT_ANALYSIS: DNAAnalysisResult = {
  id: "default-analysis-id",
  assessment_id: FIXED_ASSESSMENT_ID,
  archetype: "Twilight Navigator",
  introduction: "You are a philosophical bridge-builder who approaches meaning through careful synthesis of multiple viewpoints. Your approach combines analytical precision with an openness to paradox, allowing you to hold seemingly contradictory truths in productive tension.",
  created_at: new Date().toISOString()
};
// ---------------------------------------------------------------------------------

const ShareableProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [landscapeImage, setLandscapeImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (name) {
        try {
          setIsLoading(true);
          console.log("Fetching profile for name:", name);
          
          // FUTURE EDIT POINT: Fix the profile fetching logic here
          // ---------------------------------------------------------------------------------
          // Decode the name from URL format to handle spaces
          const decodedName = decodeURIComponent(name);
          console.log("Decoded name:", decodedName);
          
          // TODO: Fix the profile lookup
          // Currently using a fixed profile (Alex Jakubowski) instead of looking up in the database
          // Original code:
          /*
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', decodedName)
            .maybeSingle();
            
          if (data && !error) {
            const profileData = data as ProfileData;
            setProfileData(profileData);
            
            if (profileData.landscape_image) {
              setLandscapeImage(profileData.landscape_image);
            }
            
            if (profileData.profile_image) {
              setProfileImage(profileData.profile_image);
            }
            
            // Now fetch the DNA analysis for this user
            const { data: analysisData, error: analysisError } = await supabase
              .from('dna_analysis_results')
              .select('id, assessment_id, archetype, introduction, created_at')
              .eq('assessment_id', FIXED_ASSESSMENT_ID)
              .maybeSingle();
              
            if (analysisData && !analysisError) {
              setAnalysisResult(analysisData as DNAAnalysisResult);
            }
          } else {
            console.error("Error fetching profile data:", error);
            // Navigate to DNA if profile not found
            navigate('/dna');
          }
          */
          
          // Using default profile data instead of database lookup for now
          console.log("Using default profile data");
          setProfileData(DEFAULT_PROFILE);
          setLandscapeImage(DEFAULT_PROFILE.landscape_image || null);
          setProfileImage(DEFAULT_PROFILE.profile_image || null);
          setAnalysisResult(DEFAULT_ANALYSIS);
          // ---------------------------------------------------------------------------------
          
        } catch (e) {
          console.error("Exception fetching profile:", e);
          // FUTURE EDIT POINT: Don't navigate to /dna on error, just use default profile
          // ---------------------------------------------------------------------------------
          // Original code: navigate('/dna');
          console.log("Error occurred, using default profile data");
          setProfileData(DEFAULT_PROFILE);
          setLandscapeImage(DEFAULT_PROFILE.landscape_image || null);
          setProfileImage(DEFAULT_PROFILE.profile_image || null);
          setAnalysisResult(DEFAULT_ANALYSIS);
          // ---------------------------------------------------------------------------------
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfileData();
  }, [name, navigate]);

  const handleCloseClick = () => {
    navigate('/dna');
  };
  
  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileData?.full_name}'s Profile`,
          text: `Check out ${profileData?.full_name}'s reading profile!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(window.location.href);
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
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#2A282A] text-[#E9E7E2]">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  // FUTURE EDIT POINT: Re-enable this check when using real profiles
  // ---------------------------------------------------------------------------------
  // Original code:
  /*
  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#2A282A] text-[#E9E7E2]">
        <p>Profile not found</p>
        <Button 
          onClick={() => navigate('/dna')} 
          className="mt-4 bg-[#373763] text-[#E9E7E2]"
        >
          Return Home
        </Button>
      </div>
    );
  }
  */
  // ---------------------------------------------------------------------------------
  
  const fullName = profileData?.full_name || "Alex Jakubowski";
  const firstName = fullName.split(' ')[0] || "Alex";
  const lastName = fullName.split(' ').slice(1).join(' ') || "Jakubowski";
  const initials = `${firstName[0]}${lastName[0] || ""}`;
  const archetype = analysisResult?.archetype || "Twilight Navigator";
  const introduction = analysisResult?.introduction || 
    "You are a philosophical bridge-builder who approaches meaning through careful synthesis of multiple viewpoints. Your approach combines analytical precision with an openness to paradox, allowing you to hold seemingly contradictory truths in productive tension.";

  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <div className="relative w-full h-80 bg-[#2A282A]">
        {/* Close button */}
        <Button 
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-[#2A282A]/50 p-0 hover:bg-[#2A282A]/70"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-[#E9E7E2]" />
        </Button>
        
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${landscapeImage || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/landscape_images//Twilight%20Navigator.png"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: "0.5"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A282A]/0 via-[#2A282A]/70 to-[#2A282A]"></div>
        
        {/* Profile content centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-10">
          {/* Profile image in hexagon */}
          <div className="relative h-24 w-24 mb-4">
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
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={fullName} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white">
                  <span className="text-2xl font-semibold">{initials}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Name and archetype */}
          <h1 className="text-2xl font-serif text-center">{fullName}</h1>
          <p className="text-sm font-oxanium text-[#E9E7E2]/70 italic text-center mb-4">
            {archetype}
          </p>
          
          {/* Introduction text */}
          <p className="text-sm font-oxanium text-[#E9E7E2]/80 text-center max-w-md">
            {introduction}
          </p>
        </div>
      </div>
      
      {/* Action buttons section at bottom */}
      <div className="w-full px-6 py-4 flex justify-center mt-auto">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={handleShareClick}
            className="bg-[#263934] text-[#E9E7E2] uppercase font-oxanium text-sm rounded-2xl px-6 py-2 hover:bg-[#263934]/90 transition-colors flex items-center justify-center gap-2"
            aria-label="Share profile"
          >
            SHARE PROFILE
            <Share className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleCloseClick}
            className="bg-[#383741] text-[#E9E7E2] uppercase font-oxanium text-sm rounded-2xl px-6 py-2 hover:bg-[#383741]/90 transition-colors flex items-center justify-center gap-2"
            aria-label="View full profile"
          >
            VIEW FULL PROFILE
            <Hexagon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareableProfile;
