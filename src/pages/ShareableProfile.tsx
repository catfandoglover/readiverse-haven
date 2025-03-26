
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
}

interface DNAAnalysisResult {
  id: string;
  assessment_id: string;
  archetype: string | null;
  introduction: string | null;
  most_kindred_spirit: string | null;
  most_challenging_voice: string | null;
  created_at: string;
}

const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

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
  most_kindred_spirit: "Simone Weil - You share her gift of holding paradoxes in creative tension, finding meaning in the difficult spaces between competing worldviews.",
  most_challenging_voice: "Friedrich Nietzsche - His ruthless naturalism and rejection of transcendent meaning challenges your tendency to find pattern and purpose in complex systems.",
  created_at: new Date().toISOString()
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (name) {
        try {
          setIsLoading(true);
          console.log("Fetching profile for name:", name);
          
          const decodedName = decodeURIComponent(name);
          console.log("Decoded name:", decodedName);
          
          console.log("Using default profile data");
          setProfileData(DEFAULT_PROFILE);
          setLandscapeImage(DEFAULT_PROFILE.landscape_image || null);
          setProfileImage(DEFAULT_PROFILE.profile_image || null);
          setAnalysisResult(DEFAULT_ANALYSIS);
        } catch (e) {
          console.error("Exception fetching profile:", e);
          console.log("Error occurred, using default profile data");
          setProfileData(DEFAULT_PROFILE);
          setLandscapeImage(DEFAULT_PROFILE.landscape_image || null);
          setProfileImage(DEFAULT_PROFILE.profile_image || null);
          setAnalysisResult(DEFAULT_ANALYSIS);
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
  
  const handleIconClick = (iconId: string) => {
    // Navigate programmatically to the icon detail view
    navigate(`/view/icon/${iconId}`, { 
      state: { 
        fromSection: 'profile',
        sourcePath: '/dna'
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#2A282A] text-[#E9E7E2]">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  const fullName = profileData?.full_name || "Alex Jakubowski";
  const firstName = fullName.split(' ')[0] || "Alex";
  const lastName = fullName.split(' ').slice(1).join(' ') || "Jakubowski";
  const initials = `${firstName[0]}${lastName[0] || ""}`;
  const archetype = analysisResult?.archetype || "Twilight Navigator";
  const introduction = analysisResult?.introduction || 
    "You are a philosophical bridge-builder who approaches meaning through careful synthesis of multiple viewpoints. Your approach combines analytical precision with an openness to paradox, allowing you to hold seemingly contradictory truths in productive tension.";
  
  const mostKindredSpirit = analysisResult?.most_kindred_spirit || 
    "Simone Weil - You share her gift of holding paradoxes in creative tension, finding meaning in the difficult spaces between competing worldviews.";
  
  const mostChallengingVoice = analysisResult?.most_challenging_voice || 
    "Friedrich Nietzsche - His ruthless naturalism and rejection of transcendent meaning challenges your tendency to find pattern and purpose in complex systems.";
  
  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <div className="relative w-full h-64 bg-[#2A282A]">
        <Button 
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-[#2A282A]/50 p-0 hover:bg-[#2A282A]/70"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-[#E9E7E2]" />
        </Button>
        
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
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-10">
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
                <AvatarImage src={profileImage || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/profile_images//Alex%20Jakubowski.png"} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white rounded-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <h1 className="text-2xl font-serif text-center">{fullName}</h1>
          <p className="text-sm font-oxanium text-[#E9E7E2]/70 italic text-center">
            {archetype}
          </p>
        </div>
      </div>
      
      <div className="w-full px-6 py-8 flex flex-col items-center">
        <div className="max-w-lg mb-8">
          <p className="text-sm font-oxanium text-[#E9E7E2]/50">
            {introduction}
          </p>
        </div>
        
        <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between w-full max-w-lg mb-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png" 
                  alt="Friedrich Nietzsche" 
                  className="h-10 w-10 object-cover"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                FRIEDRICH NIETZSCHE
              </h3>
              <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Kindred Spirit</p>
            </div>
          </div>
          <button 
            onClick={() => handleIconClick("294e44ae-5b7b-4651-bb22-16e90bcbd886")}
            className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center"
          >
            <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
          </button>
        </div>
        
        <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between w-full max-w-lg mb-8">
          <div className="flex items-center">
            <div className="relative mr-4">
              <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png" 
                  alt="Martin Heidegger" 
                  className="h-10 w-10 object-cover"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                MARTIN HEIDEGGER
              </h3>
              <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Challenging Voice</p>
            </div>
          </div>
          <button 
            onClick={() => handleIconClick("73dd6940-6384-4f90-b9de-26334252ebee")}
            className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center"
          >
            <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
          </button>
        </div>
      </div>
      
      <div className="mt-auto w-full px-6 py-8 flex flex-col items-center">
        <button 
          onClick={() => navigate("/dna")}
          className="font-oxanium uppercase text-base font-bold text-[#E9E7E2] hover:text-[#CCFF23] transition-colors mb-2"
        >
          DISCOVER YOUR INTELLECTUAL DNA
        </button>
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
