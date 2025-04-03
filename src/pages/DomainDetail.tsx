import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Hexagon, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { MasteryScore } from "@/components/reader/MasteryScore";
import { ProgressDisplay } from "@/components/reader/ProgressDisplay";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface DNAAnalysisResult {
  theology_introduction: string | null;
  ontology_introduction: string | null;
  epistemology_introduction: string | null;
  ethics_introduction: string | null;
  politics_introduction: string | null;
  aesthetics_introduction: string | null;
  
  theology_kindred_spirit_1: string | null;
  theology_kindred_spirit_1_classic: string | null;
  theology_kindred_spirit_2: string | null;
  theology_kindred_spirit_2_classic: string | null;
  theology_kindred_spirit_3: string | null;
  theology_kindred_spirit_3_classic: string | null;
  theology_kindred_spirit_4: string | null;
  theology_kindred_spirit_4_classic: string | null;
  theology_kindred_spirit_5: string | null;
  theology_kindred_spirit_5_classic: string | null;
  
  ontology_kindred_spirit_1: string | null;
  ontology_kindred_spirit_1_classic: string | null;
  ontology_kindred_spirit_2: string | null;
  ontology_kindred_spirit_2_classic: string | null;
  ontology_kindred_spirit_3: string | null;
  ontology_kindred_spirit_3_classic: string | null;
  ontology_kindred_spirit_4: string | null;
  ontology_kindred_spirit_4_classic: string | null;
  ontology_kindred_spirit_5: string | null;
  ontology_kindred_spirit_5_classic: string | null;
  
  epistemology_kindred_spirit_1: string | null;
  epistemology_kindred_spirit_1_classic: string | null;
  epistemology_kindred_spirit_2: string | null;
  epistemology_kindred_spirit_2_classic: string | null;
  epistemology_kindred_spirit_3: string | null;
  epistemology_kindred_spirit_3_classic: string | null;
  epistemology_kindred_spirit_4: string | null;
  epistemology_kindred_spirit_4_classic: string | null;
  epistemology_kindred_spirit_5: string | null;
  epistemology_kindred_spirit_5_classic: string | null;
  
  ethics_kindred_spirit_1: string | null;
  ethics_kindred_spirit_1_classic: string | null;
  ethics_kindred_spirit_2: string | null;
  ethics_kindred_spirit_2_classic: string | null;
  ethics_kindred_spirit_3: string | null;
  ethics_kindred_spirit_3_classic: string | null;
  ethics_kindred_spirit_4: string | null;
  ethics_kindred_spirit_4_classic: string | null;
  ethics_kindred_spirit_5: string | null;
  ethics_kindred_spirit_5_classic: string | null;
  
  politics_kindred_spirit_1: string | null;
  politics_kindred_spirit_1_classic: string | null;
  politics_kindred_spirit_2: string | null;
  politics_kindred_spirit_2_classic: string | null;
  politics_kindred_spirit_3: string | null;
  politics_kindred_spirit_3_classic: string | null;
  politics_kindred_spirit_4: string | null;
  politics_kindred_spirit_4_classic: string | null;
  politics_kindred_spirit_5: string | null;
  politics_kindred_spirit_5_classic: string | null;
  
  aesthetics_kindred_spirit_1: string | null;
  aesthetics_kindred_spirit_1_classic: string | null;
  aesthetics_kindred_spirit_2: string | null;
  aesthetics_kindred_spirit_2_classic: string | null;
  aesthetics_kindred_spirit_3: string | null;
  aesthetics_kindred_spirit_3_classic: string | null;
  aesthetics_kindred_spirit_4: string | null;
  aesthetics_kindred_spirit_4_classic: string | null;
  aesthetics_kindred_spirit_5: string | null;
  aesthetics_kindred_spirit_5_classic: string | null;
  
  theology_challenging_voice_1: string | null;
  theology_challenging_voice_1_classic: string | null;
  theology_challenging_voice_2: string | null;
  theology_challenging_voice_2_classic: string | null;
  theology_challenging_voice_3: string | null;
  theology_challenging_voice_3_classic: string | null;
  theology_challenging_voice_4: string | null;
  theology_challenging_voice_4_classic: string | null;
  theology_challenging_voice_5: string | null;
  theology_challenging_voice_5_classic: string | null;
  
  ontology_challenging_voice_1: string | null;
  ontology_challenging_voice_1_classic: string | null;
  ontology_challenging_voice_2: string | null;
  ontology_challenging_voice_2_classic: string | null;
  ontology_challenging_voice_3: string | null;
  ontology_challenging_voice_3_classic: string | null;
  ontology_challenging_voice_4: string | null;
  ontology_challenging_voice_4_classic: string | null;
  ontology_challenging_voice_5: string | null;
  ontology_challenging_voice_5_classic: string | null;
  
  epistemology_challenging_voice_1: string | null;
  epistemology_challenging_voice_1_classic: string | null;
  epistemology_challenging_voice_2: string | null;
  epistemology_challenging_voice_2_classic: string | null;
  epistemology_challenging_voice_3: string | null;
  epistemology_challenging_voice_3_classic: string | null;
  epistemology_challenging_voice_4: string | null;
  epistemology_challenging_voice_4_classic: string | null;
  epistemology_challenging_voice_5: string | null;
  epistemology_challenging_voice_5_classic: string | null;
  
  ethics_challenging_voice_1: string | null;
  ethics_challenging_voice_1_classic: string | null;
  ethics_challenging_voice_2: string | null;
  ethics_challenging_voice_2_classic: string | null;
  ethics_challenging_voice_3: string | null;
  ethics_challenging_voice_3_classic: string | null;
  ethics_challenging_voice_4: string | null;
  ethics_challenging_voice_4_classic: string | null;
  ethics_challenging_voice_5: string | null;
  ethics_challenging_voice_5_classic: string | null;
  
  politics_challenging_voice_1: string | null;
  politics_challenging_voice_1_classic: string | null;
  politics_challenging_voice_2: string | null;
  politics_challenging_voice_2_classic: string | null;
  politics_challenging_voice_3: string | null;
  politics_challenging_voice_3_classic: string | null;
  politics_challenging_voice_4: string | null;
  politics_challenging_voice_4_classic: string | null;
  politics_challenging_voice_5: string | null;
  politics_challenging_voice_5_classic: string | null;
  
  aesthetics_challenging_voice_1: string | null;
  aesthetics_challenging_voice_1_classic: string | null;
  aesthetics_challenging_voice_2: string | null;
  aesthetics_challenging_voice_2_classic: string | null;
  aesthetics_challenging_voice_3: string | null;
  aesthetics_challenging_voice_3_classic: string | null;
  aesthetics_challenging_voice_4: string | null;
  aesthetics_challenging_voice_4_classic: string | null;
  aesthetics_challenging_voice_5: string | null;
  aesthetics_challenging_voice_5_classic: string | null;
  
  theology_kindred_spirit_1_rationale: string | null;
  theology_kindred_spirit_2_rationale: string | null;
  theology_kindred_spirit_3_rationale: string | null;
  theology_kindred_spirit_4_rationale: string | null;
  theology_kindred_spirit_5_rationale: string | null;
  
  ontology_kindred_spirit_1_rationale: string | null;
  ontology_kindred_spirit_2_rationale: string | null;
  ontology_kindred_spirit_3_rationale: string | null;
  ontology_kindred_spirit_4_rationale: string | null;
  ontology_kindred_spirit_5_rationale: string | null;
  
  epistemology_kindred_spirit_1_rationale: string | null;
  epistemology_kindred_spirit_2_rationale: string | null;
  epistemology_kindred_spirit_3_rationale: string | null;
  epistemology_kindred_spirit_4_rationale: string | null;
  epistemology_kindred_spirit_5_rationale: string | null;
  
  ethics_kindred_spirit_1_rationale: string | null;
  ethics_kindred_spirit_2_rationale: string | null;
  ethics_kindred_spirit_3_rationale: string | null;
  ethics_kindred_spirit_4_rationale: string | null;
  ethics_kindred_spirit_5_rationale: string | null;
  
  politics_kindred_spirit_1_rationale: string | null;
  politics_kindred_spirit_2_rationale: string | null;
  politics_kindred_spirit_3_rationale: string | null;
  politics_kindred_spirit_4_rationale: string | null;
  politics_kindred_spirit_5_rationale: string | null;
  
  aesthetics_kindred_spirit_1_rationale: string | null;
  aesthetics_kindred_spirit_2_rationale: string | null;
  aesthetics_kindred_spirit_3_rationale: string | null;
  aesthetics_kindred_spirit_4_rationale: string | null;
  aesthetics_kindred_spirit_5_rationale: string | null;
  
  theology_challenging_voice_1_rationale: string | null;
  theology_challenging_voice_2_rationale: string | null;
  theology_challenging_voice_3_rationale: string | null;
  theology_challenging_voice_4_rationale: string | null;
  theology_challenging_voice_5_rationale: string | null;
  
  ontology_challenging_voice_1_rationale: string | null;
  ontology_challenging_voice_2_rationale: string | null;
  ontology_challenging_voice_3_rationale: string | null;
  ontology_challenging_voice_4_rationale: string | null;
  ontology_challenging_voice_5_rationale: string | null;
  
  epistemology_challenging_voice_1_rationale: string | null;
  epistemology_challenging_voice_2_rationale: string | null;
  epistemology_challenging_voice_3_rationale: string | null;
  epistemology_challenging_voice_4_rationale: string | null;
  epistemology_challenging_voice_5_rationale: string | null;
  
  ethics_challenging_voice_1_rationale: string | null;
  ethics_challenging_voice_2_rationale: string | null;
  ethics_challenging_voice_3_rationale: string | null;
  ethics_challenging_voice_4_rationale: string | null;
  ethics_challenging_voice_5_rationale: string | null;
  
  politics_challenging_voice_1_rationale: string | null;
  politics_challenging_voice_2_rationale: string | null;
  politics_challenging_voice_3_rationale: string | null;
  politics_challenging_voice_4_rationale: string | null;
  politics_challenging_voice_5_rationale: string | null;
  
  aesthetics_challenging_voice_1_rationale: string | null;
  aesthetics_challenging_voice_2_rationale: string | null;
  aesthetics_challenging_voice_3_rationale: string | null;
  aesthetics_challenging_voice_4_rationale: string | null;
  aesthetics_challenging_voice_5_rationale: string | null;
}

interface ResourceData {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  progress: number;
}

const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
  const [domainAnalysis, setDomainAnalysis] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { profileData, dnaAnalysisData } = useProfileData();
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        
        // Use the DNA analysis data from context if available
        if (dnaAnalysisData) {
          console.log("Using DNA analysis data from context:", dnaAnalysisData);
          setDomainAnalysis(dnaAnalysisData as DNAAnalysisResult);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch it using the assessment_id from the profile
        if (!profileData?.assessment_id) {
          console.error("No assessment ID found in profile data");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching DNA analysis with assessment ID:", profileData.assessment_id);
        
        // First try using assessment_id field
        let { data, error } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', profileData.assessment_id)
          .maybeSingle();
          
        // If that fails, try using id field (legacy approach)
        if (!data && !error) {
          const { data: legacyData, error: legacyError } = await supabase
            .from('dna_analysis_results')
            .select('*')
            .eq('id', profileData.assessment_id)
            .maybeSingle();
            
          if (legacyData && !legacyError) {
            console.log("Found DNA analysis using legacy approach (ID match):", legacyData);
            data = legacyData;
          } else if (legacyError) {
            console.error("Error fetching DNA analysis using legacy approach:", legacyError);
          }
        }
        
        if (data) {
          console.log("Domain analysis:", data);
          setDomainAnalysis(data as DNAAnalysisResult);
        } else {
          console.error("No DNA analysis data found for assessment ID:", profileData.assessment_id);
        }
      } catch (e) {
        console.error("Exception fetching domain analysis:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomainData();
  }, [profileData, dnaAnalysisData]);
  
  const getDomainData = (id: string) => {
    const domains: Record<string, {
      title: string,
      subtitle: string,
      description: string,
      resources: Array<ResourceData>
    }> = {
      "theology": {
        title: "THEOLOGY",
        subtitle: "Your view on the Divine",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight.",
          progress: 50
        })
      },
      "ontology": {
        title: "ONTOLOGY",
        subtitle: "Your view on Reality",
        description: "Explores the nature of being and existence.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight.",
          progress: 50
        })
      },
      "epistemology": {
        title: "EPISTEMOLOGY",
        subtitle: "Your view on Knowledge",
        description: "Examines the nature and grounds of knowledge.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight.",
          progress: 50
        })
      },
      "ethics": {
        title: "ETHICS",
        subtitle: "Your view on Morality",
        description: "Addresses questions about how one should act.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight.",
          progress: 50
        })
      },
      "politics": {
        title: "POLITICS",
        subtitle: "Your view on Society",
        description: "Examines the organization and governance of communities.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight.",
          progress: 50
        })
      },
      "aesthetics": {
        title: "AESTHETICS",
        subtitle: "Your view on Beauty",
        description: "Explores the nature of beauty, art, and taste.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight.",
          progress: 50
        })
      }
    };
    
    return domains[id] || domains["theology"];
  };
  
  const domainData = getDomainData(domainId || "");

  const getDomainIntroduction = () => {
    if (isLoading) {
      return "Loading domain introduction...";
    }
    
    if (!domainAnalysis) {
      return domainData.description;
    }
    
    switch (domainId) {
      case "theology":
        return domainAnalysis.theology_introduction || domainData.description;
      case "ontology":
        return domainAnalysis.ontology_introduction || domainData.description;
      case "epistemology":
        return domainAnalysis.epistemology_introduction || domainData.description;
      case "ethics":
        return domainAnalysis.ethics_introduction || domainData.description;
      case "politics":
        return domainAnalysis.politics_introduction || domainData.description;
      case "aesthetics":
        return domainAnalysis.aesthetics_introduction || domainData.description;
      default:
        return domainData.description;
    }
  };
  
  const getResourcesForTab = (tab: "kindred" | "challenging"): ResourceData[] => {
    if (isLoading || !domainAnalysis) {
      return domainData.resources;
    }
    
    const resources: ResourceData[] = [];
    
    const dummyProgressValues = [85, 65, 45, 25, 15];
    
    for (let i = 1; i <= 5; i++) {
      let resourceKey = '';
      let classicKey = '';
      let rationaleKey = '';
      
      if (tab === "kindred") {
        resourceKey = `${domainId}_kindred_spirit_${i}`;
        classicKey = `${domainId}_kindred_spirit_${i}_classic`;
        rationaleKey = `${domainId}_kindred_spirit_${i}_rationale`;
      } else {
        resourceKey = `${domainId}_challenging_voice_${i}`;
        classicKey = `${domainId}_challenging_voice_${i}_classic`;
        rationaleKey = `${domainId}_challenging_voice_${i}_rationale`;
      }
      
      const title = domainAnalysis[resourceKey as keyof DNAAnalysisResult] || `THINKER ${i}`;
      const subtitle = domainAnalysis[classicKey as keyof DNAAnalysisResult] || `CLASSIC WORK`;
      const rationale = domainAnalysis[rationaleKey as keyof DNAAnalysisResult];
      
      resources.push({
        id: `resource-${i}`,
        image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
        title: String(title).toUpperCase(),
        subtitle: String(subtitle),
        description: rationale ? String(rationale) : `This thinker ${tab === "kindred" ? "aligns with" : "challenges"} your ${domainId} perspective.`,
        progress: dummyProgressValues[i-1]
      });
    }
    
    return resources;
  };
  
  const getResources = () => {
    return getResourcesForTab(activeTab);
  };
  
  const getProgressLevel = (progress: number): number => {
    if (progress <= 16.67) return 1;
    if (progress <= 33.33) return 2;
    if (progress <= 50) return 3;
    if (progress <= 66.67) return 4;
    if (progress <= 83.33) return 5;
    return 6;
  };
  
  const getStageName = (level: number): string => {
    const stageNames = {
      1: "SCRIBE",
      2: "MESSENGER",
      3: "ALCHEMIST",
      4: "CARTOGRAPHER", 
      5: "JUDGE",
      6: "CREATOR"
    };
    return stageNames[level as keyof typeof stageNames] || "SCRIBE";
  };
  
  const getHighestProgressLevel = (): number => {
    const kindredResources = getResourcesForTab("kindred");
    const challengingResources = getResourcesForTab("challenging");
    
    const allProgressValues = [
      ...kindredResources.map(resource => resource.progress),
      ...challengingResources.map(resource => resource.progress)
    ];
    
    if (allProgressValues.length === 0) return 1; // Default to level 1 if no resources
    
    const highestProgress = Math.max(...allProgressValues);
    
    return getProgressLevel(highestProgress);
  };

  const resources = getResources();
  const highestLevel = getHighestProgressLevel();
  const highestStageName = getStageName(highestLevel);
  
  const levels = [1, 2, 3, 4, 5, 6];
  
  const resourcesWithStatus = resources.map((resource, index) => {
    let status = "locked";
    if (index === 0) status = "completed";
    else if (index === 1) status = "active";
    else status = "locked";
    
    return {
      ...resource,
      status
    };
  });
  
  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2] relative">
      <header className="px-6 py-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/profile")}
          className="p-0 h-auto w-auto hover:bg-transparent"
        >
          <X className="h-8 w-8 text-[#E9E7E2]" />
        </Button>
        
        {/* SCORING SYSTEM - COMMENTED OUT
        <div className="flex flex-col items-center">
          <div className="relative">
            <Hexagon className="h-10 w-10 text-[#CCFF23]" strokeWidth={3} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQyMTYxNzIxLCJleHAiOjEwMzgyMTYxNzIxfQ.zq1j6pMCdisb2y8_NNbbKtCa1kSTVf3RnQzzVke6W_g"
                alt="Lightning Logo"
                className="h-9 w-9 object-cover rounded-none"
                style={{ 
                  clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                }}
              />
            </div>
          </div>
          <span className="text-[#E9E7E2] uppercase tracking-wider font-oxanium text-xs mt-1">
            {highestStageName}
          </span>
        </div>
        */}
      </header>
      
      <main className="px-6 pb-6">
        <div className="mb-10">
          <h1 className="font-baskerville uppercase text-[#E9E7E2] mb-1">{domainData.title}</h1>
          <p className="font-baskerville text-[#E9E7E2] mb-4 opacity-[0.35]">{domainData.subtitle}</p>
          <p className="font-oxanium text-[#E9E7E2] opacity-[0.5]">
            {getDomainIntroduction()}
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0",
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
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0",
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
        </div>
        
        <div className="space-y-6">
          {resourcesWithStatus.map((resource, idx) => {
            const resourceLevel = getProgressLevel(resource.progress);
            let StatusIcon = () => <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />;
            
            if (resource.status === "completed") {
              StatusIcon = () => <Check className="h-5 w-5 text-[#1A1A1A]" />;
            } else if (resource.status === "locked") {
              StatusIcon = () => <Lock className="h-4 w-4 text-[#E9E7E2]/70" />;
            }
            
            return (
              <div key={idx}>
                <div 
                  className="rounded-xl p-4 pb-1.5 shadow-inner"
                  style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(25, 53, 47, 0.1))' }}
                >
                  <div className="flex items-center mb-3">
                    <div className="flex items-center flex-1">
                      <div className="relative mr-4">
                        <Hexagon className="h-10 w-10 text-[#CCFF23]" strokeWidth={3} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={resource.image} 
                            alt={resource.title}
                            className="h-9 w-9 object-cover rounded-none"
                            style={{ 
                              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{resource.title}</h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">{resource.subtitle}</p>
                      </div>
                    </div>
                    
                    <button className={`h-8 w-8 rounded-full flex items-center justify-center ml-4 ${resource.status === "completed" ? 'bg-[#CCFF23]' : 'bg-[#E9E7E2]/10'}`}>
                      <StatusIcon />
                    </button>
                  </div>
                  
                  <ProgressDisplay 
                    progress={resource.progress || 0} 
                    showLabel={false} 
                    className="mb-3" 
                  />
                </div>
                
                <p className="text-xs text-[#9F9EA1] ml-2 font-oxanium mt-3 mb-4">{resource.description}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default DomainDetail;
