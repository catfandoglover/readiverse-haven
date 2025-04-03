import React, { useState, useEffect } from "react";
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

const ShareableProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!name) {
        setError("No profile name provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching profile for name:", name);
        
        // Decode the name from URL format to handle spaces
        const decodedName = decodeURIComponent(name).replace(/-/g, ' ');
        console.log("Decoded name:", decodedName);
        
        // Find the profile by name
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('full_name', decodedName)
          .single();
          
        if (profileError || !profileResult) {
          console.error("Error fetching profile:", profileError);
          setError("Profile not found");
          setIsLoading(false);
          return;
        }
        
        console.log("Profile data found:", profileResult);
        setProfileData(profileResult);
        setLandscapeImage(profileResult.landscape_image || null);
        setProfileImage(profileResult.profile_image || null);
        
        // Get assessment_id from profile
        const assessmentId = profileResult.assessment_id;
        if (!assessmentId) {
          console.error("No assessment ID found for profile");
          setError("No assessment data available for this profile");
          setIsLoading(false);
          return;
        }
        
        // Fetch DNA analysis data using assessment_id
        console.log("Fetching DNA analysis with assessment_id:", assessmentId);
        const { data: dnaData, error: dnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('id', assessmentId)
          .single();
          
        if (dnaError || !dnaData) {
          console.error("DNA analysis fetch error:", dnaError);
          setError("DNA analysis data not found");
          setIsLoading(false);
          return;
        }
        
        console.log("DNA analysis data fetched:", dnaData);
        setAnalysisResult(dnaData);

      } catch (e) {
        console.error("Exception fetching profile:", e);
        setError("Error loading profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [name, navigate]);

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

  const handleCloseClick = () => {
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
      <div className="flex flex-col items-center justify-center h-screen bg-[#2A282A] text-[#E9E7E2]">
        <p>{error || "Profile could not be loaded"}</p>
        <Button 
          onClick={() => navigate('/dna')}
          className="mt-4"
        >
          Go to DNA Assessment
        </Button>
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
                <AvatarImage src={profileImage || ""} />
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
          <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between w-full max-w-lg mb-6">
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
          <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between w-full max-w-lg mb-8">
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
};

export default ShareableProfile;
