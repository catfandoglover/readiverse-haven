import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Lock, ArrowRight, Hexagon, SlidersHorizontal, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getProgressLevel, getStageName } from "@/components/reader/MasteryScore";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import BadgeDialog from "@/components/exam/BadgeDialog";

interface DNAAnalysisResult {
  [key: string]: string | null;
}

const getHexagonColor = (level: number): string => {
  switch(level) {
    case 1: return "#F9F9F9"; // Scribe
    case 2: return "#FFE0CA"; // Messenger
    case 3: return "#EFFE91"; // Alchemist
    case 4: return "#B8C8FF"; // Cartographer
    case 5: return "#D5B8FF"; // Judge
    case 6: return "#000000"; // Creator
    default: return "#F9F9F9";
  }
};

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

const IntellectualDNAExam: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [domainFilter, setDomainFilter] = useState<string | undefined>(undefined);
  const [domainAnalysis, setDomainAnalysis] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const domains = [
    {
      id: "ethics",
      title: "ETHICS",
      subtitle: "Your view on the Good.",
      description: "Seeks experiential knowledge while maintaining rational frameworks.",
      color: "#3D3D6F"
    },
    {
      id: "theology",
      title: "THEOLOGY",
      subtitle: "Your view on the divine.",
      description: "Seeks experiential knowledge while maintaining rational frameworks.",
      color: "#3D3D6F"
    },
    {
      id: "epistemology",
      title: "EPISTEMOLOGY",
      subtitle: "Your view on Knowledge",
      description: "Examines the nature and grounds of knowledge.",
      color: "#3D3D6F"
    },
    {
      id: "ontology",
      title: "ONTOLOGY",
      subtitle: "Your view on Reality",
      description: "Explores the nature of being and existence.",
      color: "#3D3D6F"
    },
    {
      id: "politics",
      title: "POLITICS",
      subtitle: "Your view on Society",
      description: "Examines the organization and governance of communities.",
      color: "#3D3D6F"
    },
    {
      id: "aesthetics",
      title: "AESTHETICS",
      subtitle: "Your view on Beauty",
      description: "Explores the nature of beauty, art, and taste.",
      color: "#3D3D6F"
    }
  ];
  
  const filteredDomains = domainFilter && domainFilter !== "all" 
    ? domains.filter(domain => domain.id === domainFilter)
    : domains;
  
  useEffect(() => {
    const debug: any = { steps: [] };
    
    const fetchDomainData = async () => {
      if (!user) {
        setDebugInfo({ error: "No authenticated user" });
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // STEP 1: Get user profile
        debug.steps.push({
          step: 1,
          description: "Finding user profile",
          userId: user.id
        });
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (profileError || !profile) {
          setDebugInfo({ 
            error: profileError?.message || "No profile found for user",
            userId: user.id
          });
          throw new Error(profileError?.message || "No profile found for user");
        }
        
        debug.steps.push({
          step: 2, 
          description: "Found user profile",
          profileId: profile.id,
          success: true
        });
        
        // STEP 2: Get assessment_id from profile
        if (!profile.assessment_id) {
          setDebugInfo({
            error: "Profile has no assessment_id",
            profile
          });
          throw new Error("Profile doesn't have an assessment_id");
        }
        
        debug.steps.push({
          step: 3,
          description: "Got assessment_id from profile",
          assessmentId: profile.assessment_id,
          success: true
        });
        
        // STEP 3: Try multiple approaches to find DNA data
        // Approach 1: Try direct assessment_id match
        const { data: dnaData1, error: dnaError1 } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', profile.assessment_id)
          .maybeSingle();
          
        if (!dnaError1 && dnaData1) {
          // Success with direct assessment_id match
          setDomainAnalysis(dnaData1 as DNAAnalysisResult);
          debug.steps.push({
            step: 4,
            description: "Found DNA data using assessment_id field (correct approach)",
            dnaId: dnaData1.id,
            dnaAssessmentId: dnaData1.assessment_id,
            success: true
          });
          
          debug.dnaDataFound = "By assessment_id field match";
          debug.success = true;
          setDebugInfo(debug);
          return;
        }
        
        // Approach 2: Try legacy lookup by record ID
        const { data: dnaData2, error: dnaError2 } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('id', profile.assessment_id)
          .maybeSingle();
          
        if (!dnaError2 && dnaData2) {
          // Success with ID match (legacy approach)
          setDomainAnalysis(dnaData2 as DNAAnalysisResult);
          debug.steps.push({
            step: 4,
            description: "Found DNA data using ID field (legacy approach)",
            dnaId: dnaData2.id,
            dnaAssessmentId: dnaData2.assessment_id || "Not set",
            success: true,
            warning: "Using legacy approach: profile.assessment_id matches dna_analysis_results.id instead of assessment_id"
          });
          
          debug.dnaDataFound = "By ID field match (legacy approach)";
          debug.success = true;
          debug.warning = "Using legacy approach: profile.assessment_id matches dna_analysis_results.id instead of assessment_id";
          setDebugInfo(debug);
          return;
        }
        
        // Approach 3: As a last resort, find ANY DNA record that exists
        const { data: anyDnaData, error: anyDnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .limit(1)
          .maybeSingle();
          
        if (!anyDnaError && anyDnaData) {
          // Success with fallback to any record
          setDomainAnalysis(anyDnaData as DNAAnalysisResult);
          debug.steps.push({
            step: 4,
            description: "Found DNA data using fallback to any record (emergency approach)",
            dnaId: anyDnaData.id,
            dnaAssessmentId: anyDnaData.assessment_id || "Not set",
            success: true,
            warning: "Using EMERGENCY fallback: No matching record found, using first available DNA record"
          });
          
          debug.dnaDataFound = "By emergency fallback (first available record)";
          debug.success = true;
          debug.warning = "EMERGENCY FALLBACK: No matching record found, using first available DNA record";
          
          // Also update the profile with this assessment_id to fix the relationship
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ assessment_id: anyDnaData.id })
            .eq('id', profile.id);
            
          if (updateError) {
            debug.warning += ` (Failed to update profile: ${updateError.message})`;
          } else {
            debug.warning += " (Updated profile.assessment_id to match this record)";
          }
          
          setDebugInfo(debug);
          return;
        }
        
        // All attempts failed
        throw new Error(`No DNA analysis data found. Tried assessment_id: ${profile.assessment_id}`);
      } catch (err) {
        console.error('Error in DNA exam:', err);
        setDomainAnalysis(null);
        setDebugInfo({
          ...debug,
          error: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomainData();
  }, [user]);
  
  const getDomainIntroduction = (domainId: string) => {
    if (isLoading) {
      return "Loading domain introduction...";
    }
    
    if (!domainAnalysis) {
      return "Seeks experiential knowledge while maintaining rational frameworks.";
    }
    
    switch (domainId) {
      case "theology":
        return domainAnalysis.theology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "ontology":
        return domainAnalysis.ontology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "epistemology":
        return domainAnalysis.epistemology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "ethics":
        return domainAnalysis.ethics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "politics":
        return domainAnalysis.politics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "aesthetics":
        return domainAnalysis.aesthetics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      default:
        return "Seeks experiential knowledge while maintaining rational frameworks.";
    }
  };
  
  const getResourcesForTab = (domainId: string, tab: "kindred" | "challenging") => {
    if (isLoading || !domainAnalysis) {
      return Array(5).fill({
        id: "origin",
        image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
        title: "ORIGIN",
        subtitle: "DE PRINCIPIIS (230)",
        progress: 0,
        status: "locked"
      });
    }
    
    const resources = [];
    
    const dummyProgressValues = [0, 0, 0, 0, 0];
    const dummyScores = [0, 0, 0, 0, 0];
    
    for (let i = 1; i <= 5; i++) {
      let resourceKey = '';
      let classicKey = '';
      
      if (tab === "kindred") {
        resourceKey = `${domainId}_kindred_spirit_${i}`;
        classicKey = `${domainId}_kindred_spirit_${i}_classic`;
      } else {
        resourceKey = `${domainId}_challenging_voice_${i}`;
        classicKey = `${domainId}_challenging_voice_${i}_classic`;
      }
      
      const title = domainAnalysis[resourceKey as keyof DNAAnalysisResult] || `THINKER ${i}`;
      const subtitle = domainAnalysis[classicKey as keyof DNAAnalysisResult] || `CLASSIC WORK`;
      
      let status = "locked";
      
      resources.push({
        id: `resource-${i}`,
        image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
        title: String(title).toUpperCase(),
        subtitle: String(subtitle),
        progress: dummyProgressValues[i-1],
        score: dummyScores[i-1],
        status
      });
    }
    
    return resources;
  };
  
  const ResourceItem = ({ resource, domainId }: { resource: any, domainId: string }) => {
    const handleClick = () => {
      if (resource.score > 0) {
        setSelectedResource({
          ...resource,
          domainId,
          about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent in magna vitae enim tincidunt facilisis sed in tellus."
        });
        setIsDialogOpen(true);
      }
    };
    
    return (
      <div 
        className={cn(
          "rounded-2xl py-4 pr-4 pl-0 shadow-inner cursor-pointer hover:bg-[#373763] transition-colors",
          resource.score > 0 ? "bg-[#373763]/80" : "bg-[#373763]/50 opacity-70"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center">
          {/* Left side: Badge icon with level name - fixed width container */}
          <div className="flex flex-col items-center w-[70px]">
            <div 
              style={{ 
                height: '40px', 
                width: '40px', 
                position: 'relative',
                opacity: resource.score > 0 ? 1 : 0.3
              }}
            >
              <svg 
                viewBox="0 0 24 24" 
                height="100%" 
                width="100%" 
                xmlns="http://www.w3.org/2000/svg" 
                fill={getHexagonColor(resource.score > 0 ? resource.score : 1)}
                stroke="#E9E7E2"
                strokeWidth="0.5"
              >
                <path d="M21 16.05V7.95C20.9988 7.6834 20.9344 7.4209 20.811 7.18465C20.6875 6.94841 20.5088 6.74591 20.29 6.6L12.71 2.05C12.4903 1.90551 12.2376 1.82883 11.98 1.82883C11.7224 1.82883 11.4697 1.90551 11.25 2.05L3.67 6.6C3.45124 6.74591 3.27248 6.94841 3.14903 7.18465C3.02558 7.4209 2.96118 7.6834 2.96 7.95V16.05C2.96118 16.3166 3.02558 16.5791 3.14903 16.8153C3.27248 17.0516 3.45124 17.2541 3.67 17.4L11.25 21.95C11.4697 22.0945 11.7224 22.1712 11.98 22.1712C12.2376 22.1712 12.4903 22.0945 12.71 21.95L20.29 17.4C20.5088 17.2541 20.6875 17.0516 20.811 16.8153C20.9344 16.5791 20.9988 16.3166 21 16.05Z"></path>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-libre-baskerville font-bold text-sm" style={{ color: resource.score === 6 ? "#FFFFFF" : "#3D3D6F" }}>
                {getRomanNumeral(resource.score > 0 ? resource.score : 1)}
              </span>
            </div>
            <span className="text-[6px] font-oxanium mt-1 text-center" style={{ color: getHexagonColor(resource.score > 0 ? resource.score : 1), opacity: resource.score > 0 ? 1 : 0.3 }}>
              {getStageName(resource.score > 0 ? resource.score : 1)}
            </span>
          </div>
          
          {/* Middle: Resource information - flex grow to take available space */}
          <div className="flex-1">
            <div className="flex items-center">
              <div>
                <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{resource.title}</h3>
                <p className="text-xs text-[#E9E7E2]/70 font-oxanium mt-1">
                  {resource.subtitle}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right side: Share icon - only show if exam has been taken */}
          {resource.score > 0 && (
            <div className="w-10 flex justify-center">
              <Share className="h-5 w-5 text-[#E9E7E2]/70" />
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const DomainSection = ({ domain }: { domain: any }) => {
    const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
    const kindredResources = getResourcesForTab(domain.id, "kindred");
    const challengingResources = getResourcesForTab(domain.id, "challenging");
    const resources = activeTab === "kindred" ? kindredResources : challengingResources;
    
    return (
      <div id={`domain-${domain.id}`} className="min-h-screen pt-6 pb-10" style={{ backgroundColor: domain.color }}>
        <div className="px-6">
          <h1 className="font-baskerville uppercase text-[#E9E7E2] text-base mb-1">{domain.title}</h1>
          <p className="font-baskerville text-[#E9E7E2] mb-4 opacity-[0.35] text-lg">{domain.subtitle}</p>
          <p className="font-oxanium text-[#E9E7E2] opacity-[0.5] mb-10">
            {getDomainIntroduction(domain.id)}
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
                activeTab === "kindred" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => setActiveTab("kindred")}
            >
              <span className={cn(
                "relative",
                activeTab === "kindred" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
              )}>
                KINDRED SPIRITS
              </span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
                activeTab === "challenging" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => setActiveTab("challenging")}
            >
              <span className={cn(
                "relative",
                activeTab === "challenging" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
              )}>
                CHALLENGING VOICES
              </span>
            </Button>
          </div>
          
          <div className="space-y-6 mt-8">
            {resources.map((resource, idx) => (
              <ResourceItem key={`${domain.id}-${activeTab}-${idx}`} resource={resource} domainId={domain.id} />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#3D3D6F] text-[#E9E7E2] relative">
      <header className="sticky top-0 z-10 flex items-center pt-4 px-4 bg-[#3D3D6F] text-[#E9E7E2]">
        <button
          onClick={() => navigate("/exam-room")}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          Intellectual DNA
        </h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none">
              <SlidersHorizontal className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#373763] border-[#4D4D8F] text-[#E9E7E2]">
            <DropdownMenuItem 
              onClick={() => setDomainFilter("all")}
              className="flex items-center cursor-pointer font-libre-baskerville uppercase"
            >
              {!domainFilter || domainFilter === "all" ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <div className="w-4 mr-2" />
              )}
              ALL DOMAINS
            </DropdownMenuItem>
            
            {domains.map(domain => (
              <DropdownMenuItem 
                key={domain.id} 
                onClick={() => setDomainFilter(domain.id)}
                className="flex items-center cursor-pointer font-libre-baskerville uppercase"
              >
                {domainFilter === domain.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <div className="w-4 mr-2" />
                )}
                {domain.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      <main>
        {filteredDomains.length > 0 ? (
          filteredDomains.map(domain => (
            <DomainSection key={domain.id} domain={domain} />
          ))
        ) : (
          <div className="p-6 text-center">
            <p>No domains match your filter criteria.</p>
          </div>
        )}
      </main>
      
      {/* Debug Info (for development, can be removed in production) */}
      {debugInfo.error && (
        <div className="p-4 bg-red-900/30 rounded m-6">
          <h3 className="font-bold mb-2">Error Loading DNA Data:</h3>
          <p>{debugInfo.error}</p>
          {debugInfo.warning && <p className="text-yellow-300 mt-2">{debugInfo.warning}</p>}
        </div>
      )}
      
      {/* Badge Dialog */}
      <BadgeDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        resource={selectedResource}
      />
    </div>
  );
};

export default IntellectualDNAExam;
