import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ArrowRight, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatText } from "@/hooks/useFormatText";
import { Hexagon } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface ProfileData {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  landscape_image?: string;
  profile_image?: string;
  assessment_id?: string;
  vanity_url?: string;
}

// Interface for the details we fetch for an icon
interface IconDetails {
  illustration: string;
  slug: string | null;
}

interface DNAAnalysisResult {
  id: string;
  assessment_id: string;
  archetype: string | null;
  introduction: string | null;
  most_kindred_spirit: string | null;
  most_challenging_voice: string | null;
  share_summary: string | null;
  created_at: string;
}

// Updated fallback icon URL
const FALLBACK_ICON = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0NzA4MzkyLCJleHAiOjg4MTQ0NjIxOTkyfQ.j00YuzyHMx4mcoOa9Sye0Vg2yssKfa4a3xSXJSszKHM";

// Function to get an icon illustration URL and slug by name
const getIconDetailsByName = async (name: string | null): Promise<IconDetails> => {
  if (!name) {
    return { illustration: FALLBACK_ICON, slug: null };
  }
  
  // Extract just the name part before any dash or hyphen
  const simpleName = name.split(' - ')[0];
  
  try {
    const { data, error } = await supabase
      .from('icons')
      .select('illustration, slug') // Fetch slug as well
      .ilike('name', `%${simpleName}%`)
      .limit(1);
      
    if (error || !data || data.length === 0 || !data[0].illustration) {
      console.error('Error finding icon details for:', simpleName, error);
      return { illustration: FALLBACK_ICON, slug: null };
    }
    
    // Return both illustration and slug
    return { 
      illustration: data[0].illustration, 
      slug: data[0].slug 
    };
  } catch (err) {
    console.error('Error fetching icon details by name:', err);
    return { illustration: FALLBACK_ICON, slug: null };
  }
};

function ShareableProfile(): JSX.Element {
  const { name } = useParams() as { name: string };
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatText } = useFormatText();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [landscapeImage, setLandscapeImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kindredSpiritIconUrl, setKindredSpiritIconUrl] = useState<string>("");
  const [challengingVoiceIconUrl, setChallengingVoiceIconUrl] = useState<string>("");
  const [kindredSpiritSlug, setKindredSpiritSlug] = useState<string | null>(null);
  const [challengingVoiceSlug, setChallengingVoiceSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Add new state and refs for scroll effects
  const [shouldBlurHeader, setShouldBlurHeader] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to navigate to icon detail page using slug or name
  const navigateToIconDetail = (slug: string | null, iconName: string | null): void => {
    if (slug) {
      navigate(`/icons/${slug}`);
    } else if (iconName) {
      // Fallback: Format the name for URL (lowercase, replace spaces with hyphens)
      const formattedName = iconName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/icons/${formattedName}`);
    } else {
      console.warn("Cannot navigate, no slug or name provided for icon.");
    }
  };

  // Function to handle sharing profile 
  const handleShareClick = async () => {
    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "Unable to share profile",
          variant: "destructive",
        });
        return;
      }
      
      // Use the current URL for sharing
      const shareUrl = window.location.href;
      
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!name) {
        setError("No profile identifier provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Processing profile identifier:", name);
        
        // Try all available lookup methods
        let profile: ProfileData | null = null;
        
        try {
          // Step 1: Try finding by exact vanity URL (preferred)
          const { data, error } = await supabase
            .from('profiles')
            .select('id, user_id, full_name, profile_image, landscape_image, assessment_id')
            .eq('vanity_url', name)
            .maybeSingle();
            
          if (!error && data) {
            console.log("Profile found by vanity_url:", data);
            profile = data as unknown as ProfileData;
          }
        } catch (err) {
          console.log("Error or vanity_url column not available:", err);
        }
        
        // Step 2: If not found, try name-id combination (legacy format)
        if (!profile) {
          console.log("Trying legacy vanity URL format...");
          const nameParts = decodeURIComponent(name).split('-');
          
          if (nameParts.length > 1) {
            const potentialIdSuffix = nameParts[nameParts.length - 1];
            
            if (/^[a-zA-Z0-9]{4}$/.test(potentialIdSuffix)) {
              const userIdPrefix = potentialIdSuffix;
              const decodedName = nameParts.slice(0, nameParts.length - 1).join(' ');
              
              console.log("Parsed legacy URL - Name:", decodedName, "ID prefix:", userIdPrefix);
              
              const { data, error } = await supabase
                .from('profiles')
                .select('id, user_id, full_name, profile_image, landscape_image, assessment_id')
                .ilike('full_name', decodedName)
                .filter('user_id', 'ilike', `${userIdPrefix}%`);
                
              if (!error && data && data.length > 0) {
                console.log("Profile found by name+id prefix:", data[0]);
                profile = data[0] as unknown as ProfileData;
              }
            }
          }
        }
        
        if (!profile) {
          console.error("No profile found for identifier:", name);
          setError("Profile not found. The link may be incorrect.");
          setIsLoading(false);
          return;
        }
        
        // Step 3: Profile found, load the data
        console.log("Using profile:", profile);
        setProfileData(profile);
        setLandscapeImage(profile.landscape_image || null);
        setProfileImage(profile.profile_image || null);
        
        // Step 4: Get DNA analysis data using assessment_id
        const assessmentId = profile.assessment_id;
        if (!assessmentId) {
          console.error("No assessment ID found for profile:", profile.id);
          setError("No assessment data available for this profile");
          setIsLoading(false);
          return;
        }
        
        console.log("Looking up DNA data with assessment_id:", assessmentId);
        let dnaData = null;
        
        // Try both ways to find DNA data
        const { data: dnaById, error: dnaByIdError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('id', assessmentId)
          .maybeSingle();
          
        if (!dnaByIdError && dnaById) {
          console.log("DNA data found by direct ID match:", dnaById);
          dnaData = dnaById;
        } else {
          // Try assessment_id field
          const { data: dnaByAssessmentId, error: dnaByAssessmentIdError } = await supabase
            .from('dna_analysis_results')
            .select('*')
            .eq('assessment_id', assessmentId)
            .maybeSingle();
            
          if (!dnaByAssessmentIdError && dnaByAssessmentId) {
            console.log("DNA data found by assessment_id field:", dnaByAssessmentId);
            dnaData = dnaByAssessmentId;
          }
        }
        
        if (!dnaData) {
          console.error("No DNA analysis data found for assessment_id:", assessmentId);
          setError("Could not load the analysis data associated with this profile.");
          setIsLoading(false);
          return;
        }
        
        setAnalysisResult(dnaData);

      } catch (e) {
        console.error("Exception during profile fetch process:", e);
        setError("An unexpected error occurred while loading profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [name, navigate]);

  // Add scroll effect handler
  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current || !scrollContainerRef.current) return;
      
      const imageBottom = imageRef.current.getBoundingClientRect().bottom;
      const headerBottom = 60; // approximate header height
      
      setShouldBlurHeader(imageBottom <= headerBottom);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Fetch icon URLs when analysisResult changes
  useEffect(() => {
    const fetchIcons = async () => {
      if (analysisResult?.most_kindred_spirit) {
        const { illustration, slug } = await getIconDetailsByName(analysisResult.most_kindred_spirit);
        setKindredSpiritIconUrl(illustration);
        setKindredSpiritSlug(slug);
        console.log("Set kindred spirit icon URL:", illustration);
      }
      
      if (analysisResult?.most_challenging_voice) {
        const { illustration, slug } = await getIconDetailsByName(analysisResult.most_challenging_voice);
        setChallengingVoiceIconUrl(illustration);
        setChallengingVoiceSlug(slug);
        console.log("Set challenging voice icon URL:", illustration);
      }
    };
    
    if (analysisResult) {
      fetchIcons();
    }
  }, [analysisResult]);

  const handleCloseClick = (): void => {
  navigate('/dna');
};
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#2A282A] text-[#E9E7E2]">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profileData || !analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#2A282A] text-[#E9E7E2] p-8">
        <h1 className="text-2xl font-serif mb-4">Profile Not Available</h1>
        <p className="text-center mb-6 max-w-md">
          {error || "This profile could not be loaded. The link may be incorrect or the profile may not be public."}
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button 
            onClick={() => navigate('/dna')}
            className="bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium w-full"
          >
            Discover Your Intellectual DNA
          </Button>
          <Button 
            onClick={() => navigate('/discover')}
            variant="outline"
            className="border-[#E9E7E2]/20 text-[#E9E7E2]/80 hover:bg-[#E9E7E2]/10 hover:text-[#E9E7E2] transition-colors font-oxanium w-full"
          >
            Explore Lightning Inspiration
          </Button>
        </div>
        
        <p className="mt-8 text-sm text-[#E9E7E2]/50 text-center">
          Lightning Inspiration helps you discover your intellectual DNA and connect with ideas that resonate with you.
        </p>
      </div>
    );
  }
  
  // Extract data from profile and analysis
  const fullName = profileData.full_name || "";
  const firstName = fullName.split(' ')[0] || "";
  const lastName = fullName.split(' ').slice(1).join(' ') || "";
  const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : "";
  
  const archetype = analysisResult.archetype || "";
  const introduction = analysisResult.introduction || "";
  const shareSummary = analysisResult.share_summary || introduction;
  
  // Extract kindred spirit and challenging voice information
  const kindredSpirit = analysisResult.most_kindred_spirit || "";
  const kindredSpiritName = kindredSpirit.split(' - ')[0];
  
  const challengingVoice = analysisResult.most_challenging_voice || "";
  const challengingVoiceName = challengingVoice.split(' - ')[0];
  
  return (
    <div className="flex flex-col bg-[#2A282A] text-[#E9E7E2] fixed inset-0">
      <div className="relative w-full h-[30vh] min-h-[180px] max-h-[230px] bg-[#2A282A] flex-shrink-0">
        {/* Back button - only shown to authenticated users */}
        {user && (
          <Button 
            onClick={() => navigate('/profile')}
            className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full p-0 hover:bg-transparent"
            aria-label="Back to profile"
            variant="ghost"
          >
            <ArrowRight className="h-6 w-6 text-[#E9E7E2] transform rotate-180" />
          </Button>
        )}
        
        {/* Conditional rendering based on authentication status */}
        {user ? (
          /* Share button for authenticated users - no background styling */
          <Button 
            onClick={handleShareClick}
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full p-0 hover:bg-transparent" 
            aria-label="Share profile"
            variant="ghost"
          >
            <Share className="h-6 w-6 text-[#E9E7E2]" />
          </Button>
        ) : (
          /* Close button for unauthenticated users - no background */
          <Button 
            onClick={handleCloseClick}
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full p-0 hover:bg-transparent"
            aria-label="Close"
            variant="ghost"
          >
            <X className="h-6 w-6 text-[#E9E7E2]" />
          </Button>
        )}
        
        {/* Background image with overlay */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A282A]/50 via-[#2A282A]/70 to-[#2A282A]"></div>
        
        {/* Profile content centered but moved lower in the header */}
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-4">
          {/* Profile image in hexagon - Using the same styling as the profile page */}
          <div className="relative h-20 w-20 mb-2">
            {/* Updated hexagon styling to match ProfileHeader */}
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
            
            {/* Updated to use the gradient border effect */}
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
          
          {/* Name above archetype but with swapped styling and reduced spacing */}
          <p className="text-sm font-libre-baskerville italic text-[#E9E7E2]/70 text-center mb-0.5">
            {fullName}
          </p>
          <h1 className="text-xl font-libre-baskerville font-bold text-center">{archetype}</h1>
        </div>
      </div>
      
      {/* Middle flexible section - content with reduced top padding */}
      <div className="flex-1 flex flex-col px-6 overflow-auto">
        {/* Reduced top spacing */}
        <div className="pt-2"></div>
        
        {/* Share Summary text - show all text without truncation and centered */}
        <div className="max-w-lg w-full mx-auto mb-4">
          <p className="text-sm font-oxanium text-[#E9E7E2]/50 text-center">
            {shareSummary}
          </p>
        </div>
        
        {/* Horizontal container for cards */}
        <div className="w-full max-w-lg mx-auto mt-2">
          <div className="flex justify-center gap-4 w-full">
            {/* Most Kindred Spirit Card */}
            {kindredSpirit && (
              <div 
                onClick={() => navigateToIconDetail(kindredSpiritSlug, kindredSpiritName)}
                className="flex-shrink-0 group relative cursor-pointer"
                style={{ width: 'calc(42vw - 16px)', maxWidth: '170px' }}
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                  <img
                    src={kindredSpiritIconUrl || FALLBACK_ICON}
                    alt={kindredSpiritName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_ICON;
                    }}
                  />
                  
                  {/* Type indicator - centered at the top */}
                  <div className="absolute top-2 left-0 right-0 flex justify-center">
                    <div className="rounded-2xl px-3 py-1 backdrop-blur-sm bg-[#1D3A35]/90 flex justify-center items-center">
                      <span className="font-oxanium italic uppercase text-[10px] tracking-tight text-white whitespace-nowrap text-center">
                        MOST KINDRED SPIRIT
                      </span>
                    </div>
                  </div>
                  
                  {/* Name overlay - smaller font size and wrapping text */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="font-oxanium uppercase italic text-[14px] tracking-tight text-white text-shadow drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] font-medium break-words leading-tight block">
                      {kindredSpiritName}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Most Challenging Voice Card */}
            {challengingVoice && (
              <div
                onClick={() => navigateToIconDetail(challengingVoiceSlug, challengingVoiceName)}
                className="flex-shrink-0 group relative cursor-pointer"
                style={{ width: 'calc(42vw - 16px)', maxWidth: '170px' }}
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                  <img
                    src={challengingVoiceIconUrl || FALLBACK_ICON}
                    alt={challengingVoiceName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_ICON;
                    }}
                  />
                  
                  {/* Type indicator - centered at the top */}
                  <div className="absolute top-2 left-0 right-0 flex justify-center">
                    <div className="rounded-2xl px-3 py-1 backdrop-blur-sm bg-[#301630]/90 flex justify-center items-center">
                      <span className="font-oxanium italic uppercase text-[10px] tracking-tight text-white whitespace-nowrap text-center">
                        MOST CHALLENGING VOICE
                      </span>
                    </div>
                  </div>
                  
                  {/* Name overlay - smaller font size and wrapping text */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="font-oxanium uppercase italic text-[14px] tracking-tight text-white text-shadow drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] font-medium break-words leading-tight block">
                      {challengingVoiceName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Spacer div to push footer to bottom when content is short */}
        <div className="flex-grow"></div>
      </div>
      
      {/* Footer links - not fixed anymore, moves with content */}
      <div className="w-full px-6 py-4 flex flex-col items-center flex-shrink-0 mt-4">
        <a 
          href="/dna" 
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
          www.lightninginspiration.com
        </a>
      </div>
    </div>
  );
}

export default ShareableProfile;
