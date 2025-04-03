import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatText } from "@/hooks/useFormatText";
import { Hexagon } from "lucide-react";

interface ProfileData {
  id: string;
  outseta_user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  landscape_image?: string;
  profile_image?: string;
  assessment_id?: string;
  vanity_url?: string;
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

const FALLBACK_ICON = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQzNjI4OTkwLCJleHAiOjg2NTc0MzU0MjU5MH0.iC8ooiUUENlvy-6ZtRexi_3jIJS5lBy2Y5FnUM82p9o";

// Function to get an icon URL by name
const getIconUrlByName = async (name: string | null): Promise<string> => {
  if (!name) {
    return FALLBACK_ICON;
  }
  
  // Extract just the name part before any dash or hyphen
  const simpleName = name.split(' - ')[0];
  
  try {
    const { data, error } = await supabase
      .from('icons')
      .select('illustration')
      .ilike('name', `%${simpleName}%`)
      .limit(1);
      
    if (error || !data || data.length === 0) {
      console.error('Error finding icon for:', simpleName, error);
      return FALLBACK_ICON;
    }
    
    return data[0].illustration;
  } catch (err) {
    console.error('Error fetching icon by name:', err);
    return FALLBACK_ICON;
  }
};

function ShareableProfile(): JSX.Element {
  const { name } = useParams() as { name: string };
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatText } = useFormatText();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [landscapeImage, setLandscapeImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kindredSpiritIconUrl, setKindredSpiritIconUrl] = useState<string>("");
  const [challengingVoiceIconUrl, setChallengingVoiceIconUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // Add new state and refs for scroll effects
  const [shouldBlurHeader, setShouldBlurHeader] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to navigate to icon detail page
  const navigateToIconDetail = (iconName: string | null): void => {
    if (!iconName) return;
    // Format the name for URL (lowercase, replace spaces with hyphens)
    const formattedName = iconName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/view/icon/${formattedName}`);
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
        const url = await getIconUrlByName(analysisResult.most_kindred_spirit);
        setKindredSpiritIconUrl(url);
        console.log("Set kindred spirit icon URL:", url);
      }
      
      if (analysisResult?.most_challenging_voice) {
        const url = await getIconUrlByName(analysisResult.most_challenging_voice);
        setChallengingVoiceIconUrl(url);
        console.log("Set challenging voice icon URL:", url);
      }
    };
    
    if (analysisResult) {
      fetchIcons();
    }
  }, [analysisResult]);

  const handleCloseClick = (): void => {
    navigate(-1);
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
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <div className="relative w-full h-64 bg-[#2A282A]">
        {/* Close button */}
        <Button 
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-[#2A282A]/50 p-0 hover:bg-[#2A282A]/70"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-[#E9E7E2]" />
        </Button>
        
        {/* Background image with overlay */}
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
        
        {/* Profile content centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-10">
          {/* Profile image in hexagon - Using the same styling as the profile page */}
          <div className="relative h-20 w-20 mb-3">
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
                <AvatarImage src={profileImage || FALLBACK_ICON} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Name and archetype */}
          <h1 className="text-2xl font-serif text-center">{fullName}</h1>
          <p className="text-sm font-oxanium text-[#E9E7E2]/70 italic text-center">
            {archetype}
          </p>
        </div>
      </div>
      
      {/* Content area below the landscape image */}
      <div className="w-full px-6 py-8 flex flex-col items-center">
        {/* Share Summary text */}
        <div className="max-w-lg mb-8">
          <p className="text-sm font-oxanium text-[#E9E7E2]/50">
            {shareSummary}
          </p>
        </div>
        
        {/* Most Kindred Spirit section - Only shown if data exists */}
        {kindredSpirit && (
          <div 
            className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between w-full max-w-lg mb-6 cursor-pointer hover:bg-[#383741] transition-colors"
            onClick={() => navigateToIconDetail(kindredSpiritName)}
            role="button"
            aria-label={`View details for ${kindredSpiritName}`}
          >
            <div className="flex items-center">
              <div className="relative mr-4">
                <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={kindredSpiritIconUrl} 
                    alt={kindredSpiritName} 
                    className="h-10 w-10 object-cover"
                    style={{ 
                      clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                  {kindredSpiritName}
                </h3>
                <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Kindred Spirit</p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
            </div>
          </div>
        )}
        
        {/* Most Challenging Voice section - Only shown if data exists */}
        {challengingVoice && (
          <div
            className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between w-full max-w-lg mb-8 cursor-pointer hover:bg-[#383741] transition-colors"
            onClick={() => navigateToIconDetail(challengingVoiceName)}
            role="button"
            aria-label={`View details for ${challengingVoiceName}`}
          >
            <div className="flex items-center">
              <div className="relative mr-4">
                <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={challengingVoiceIconUrl} 
                    alt={challengingVoiceName} 
                    className="h-10 w-10 object-cover"
                    style={{ 
                      clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                  {challengingVoiceName}
                </h3>
                <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Challenging Voice</p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
            </div>
          </div>
        )}
      </div>
      
      {/* Footer links */}
      <div className="mt-auto w-full px-6 py-8 flex flex-col items-center">
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
