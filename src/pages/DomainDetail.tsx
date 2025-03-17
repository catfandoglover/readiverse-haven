import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

interface DNAAnalysisResult {
  theology_introduction: string | null;
  ontology_introduction: string | null;
  epistemology_introduction: string | null;
  ethics_introduction: string | null;
  politics_introduction: string | null;
  aesthetics_introduction: string | null;
}

const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
  const [domainIntroductions, setDomainIntroductions] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('theology_introduction, ontology_introduction, epistemology_introduction, ethics_introduction, politics_introduction, aesthetics_introduction')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
          .maybeSingle();
          
        if (data && !error) {
          console.log("Domain introductions:", data);
          setDomainIntroductions(data as DNAAnalysisResult);
        } else {
          console.error("Error fetching domain introductions:", error);
        }
      } catch (e) {
        console.error("Exception fetching domain introductions:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomainData();
  }, []);
  
  const getDomainData = (id: string) => {
    const domains: Record<string, {
      title: string,
      subtitle: string,
      description: string,
      resources: Array<{
        id: string,
        image: string,
        title: string,
        subtitle: string,
        description: string
      }>
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
          description: "Divine truth requires both rational inquiry and mystical insight."
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
          description: "Divine truth requires both rational inquiry and mystical insight."
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
          description: "Divine truth requires both rational inquiry and mystical insight."
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
          description: "Divine truth requires both rational inquiry and mystical insight."
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
          description: "Divine truth requires both rational inquiry and mystical insight."
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
          description: "Divine truth requires both rational inquiry and mystical insight."
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
    
    if (!domainIntroductions) {
      return domainData.description;
    }
    
    switch (domainId) {
      case "theology":
        return domainIntroductions.theology_introduction || domainData.description;
      case "ontology":
        return domainIntroductions.ontology_introduction || domainData.description;
      case "epistemology":
        return domainIntroductions.epistemology_introduction || domainData.description;
      case "ethics":
        return domainIntroductions.ethics_introduction || domainData.description;
      case "politics":
        return domainIntroductions.politics_introduction || domainData.description;
      case "aesthetics":
        return domainIntroductions.aesthetics_introduction || domainData.description;
      default:
        return domainData.description;
    }
  };
  
  const levels = [1, 2, 3, 4, 5, 6];
  
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
  
  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2] relative">
      <header className="px-6 py-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="p-0 h-auto w-auto hover:bg-transparent"
        >
          <X className="h-8 w-8 text-white" />
        </Button>
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
          <span className="text-[#E9E7E2] uppercase tracking-wider font-oxanium text-xs mt-1">SCRIBE</span>
        </div>
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
          {domainData.resources.map((resource, idx) => (
            <div key={idx}>
              <div className="rounded-xl p-4 pb-1.5 bg-[#383741]/80 shadow-inner">
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
                  
                  <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center ml-4">
                    <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                  </button>
                </div>
                
                <div className="ml-2 mb-3">
                  <div className="flex space-x-1">
                    {levels.map(level => {
                      const currentLevel = 3;
                      
                      return (
                        <div key={level} className="relative w-7 h-8 pb-2">
                          <Hexagon 
                            className={`w-7 h-8 ${level <= currentLevel ? 'text-[#CCFF23]' : 'text-[#CCFF23]/20'}`}
                            strokeWidth={1}
                          />
                          <span 
                            className={`absolute inset-0 flex items-center justify-center text-xs font-bold
                              ${level <= currentLevel ? 'text-[#E9E7E2]' : 'text-[#E9E7E2]/40'}`}
                          >
                            {level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-[#E9E7E2]/60 block font-oxanium mt-1">
                    {getStageName(3)}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-[#9F9EA1] ml-2 font-oxanium mt-2 mb-4">{resource.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DomainDetail;
