import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ArrowRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { ProgressDisplay } from "@/components/reader/ProgressDisplay";
import { useProfileData } from "@/contexts/ProfileDataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DNAAnalysisResult {
  [key: string]: string | null;
}

const BecomeWhoYouAre: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dnaAnalysisData, isLoading, getIconByName } = useProfileData();
  const [domainFilter, setDomainFilter] = useState<string | undefined>(undefined);
  
  const domains = [
    {
      id: "ethics",
      title: "ETHICS",
      subtitle: "Your view on the Good.",
      description: "Seeks experiential knowledge while maintaining rational frameworks.",
      color: "#332e38"
    },
    {
      id: "theology",
      title: "THEOLOGY",
      subtitle: "Your view on the divine.",
      description: "Seeks experiential knowledge while maintaining rational frameworks.",
      color: "#332e38"
    },
    {
      id: "epistemology",
      title: "EPISTEMOLOGY",
      subtitle: "Your view on Knowledge",
      description: "Examines the nature and grounds of knowledge.",
      color: "#332e38"
    },
    {
      id: "ontology",
      title: "ONTOLOGY",
      subtitle: "Your view on Reality",
      description: "Explores the nature of being and existence.",
      color: "#332e38"
    },
    {
      id: "politics",
      title: "POLITICS",
      subtitle: "Your view on Society",
      description: "Examines the organization and governance of communities.",
      color: "#332e38"
    },
    {
      id: "aesthetics",
      title: "AESTHETICS",
      subtitle: "Your view on Beauty",
      description: "Explores the nature of beauty, art, and taste.",
      color: "#332e38"
    }
  ];
  
  const filteredDomains = domainFilter && domainFilter !== "all" 
    ? domains.filter(domain => domain.id === domainFilter)
    : domains;
  
  useEffect(() => {
    document.title = "Become Who You Are | Intellectual DNA";
  }, []);
  
  const getDomainIntroduction = (domainId: string) => {
    if (isLoading) {
      return "Loading domain introduction...";
    }
    
    if (!dnaAnalysisData) {
      return "Seeks experiential knowledge while maintaining rational frameworks.";
    }
    
    switch (domainId) {
      case "theology":
        return dnaAnalysisData.theology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "ontology":
        return dnaAnalysisData.ontology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "epistemology":
        return dnaAnalysisData.epistemology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "ethics":
        return dnaAnalysisData.ethics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "politics":
        return dnaAnalysisData.politics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "aesthetics":
        return dnaAnalysisData.aesthetics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      default:
        return "Seeks experiential knowledge while maintaining rational frameworks.";
    }
  };
  
  const getIconUrl = (dbId: string | null): string | null => {
    if (!dbId) return "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8";
    
    return "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"; // Default fallback
  };
  
  const getResourcesForTab = (domainId: string, tab: "kindred" | "challenging") => {
    if (isLoading || !dnaAnalysisData) {
      return Array(5).fill({
        id: "origin",
        image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8",
        title: "ORIGIN",
        subtitle: "DE PRINCIPIIS (230)",
        description: "Divine truth requires both rational inquiry and mystical insight.",
        progress: 50,
        status: "locked",
        rationale: "Loading rationale..."
      });
    }
    
    const resources = [];
    
    const dummyProgressValues = [85, 65, 45, 25, 15];
    
    for (let i = 1; i <= 5; i++) {
      let resourceKey = '';
      let classicKey = '';
      let rationaleKey = '';
      let dbIdKey = '';
      
      if (tab === "kindred") {
        resourceKey = `${domainId}_kindred_spirit_${i}`;
        classicKey = `${domainId}_kindred_spirit_${i}_classic`;
        rationaleKey = `${domainId}_kindred_spirit_${i}_rationale`;
        dbIdKey = `${domainId}_kindred_spirit_${i}_db_id`;
      } else {
        resourceKey = `${domainId}_challenging_voice_${i}`;
        classicKey = `${domainId}_challenging_voice_${i}_classic`;
        rationaleKey = `${domainId}_challenging_voice_${i}_rationale`;
        dbIdKey = `${domainId}_challenging_voice_${i}_db_id`;
      }
      
      const title = dnaAnalysisData[resourceKey as keyof DNAAnalysisResult] || `THINKER ${i}`;
      const subtitle = dnaAnalysisData[classicKey as keyof DNAAnalysisResult] || `CLASSIC WORK`;
      const rationale = dnaAnalysisData[rationaleKey as keyof DNAAnalysisResult];
      const dbId = dnaAnalysisData[dbIdKey as keyof DNAAnalysisResult];
      
      let status = "locked";
      if (i === 1) status = "completed";
      else if (i === 2) status = "active";
      else status = "locked";
      
      resources.push({
        id: `resource-${i}`,
        image: getIconUrl(dbId as string) || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8",
        title: String(title).toUpperCase(),
        subtitle: String(subtitle),
        description: rationale ? String(rationale) : `This thinker ${tab === "kindred" ? "aligns with" : "challenges"} your ${domainId} perspective.`,
        progress: dummyProgressValues[i-1],
        status,
        rationale: rationale || `This thinker ${tab === "kindred" ? "aligns with" : "challenges"} your ${domainId} perspective.`
      });
    }
    
    return resources;
  };
  
  const ResourceItem = ({ resource, domainId }: { resource: any, domainId: string }) => {
    return (
      <div>
        <div 
          className="rounded-xl p-4 pb-1.5 bg-[#383741]/80 shadow-inner cursor-pointer hover:bg-[#383741] transition-colors"
        >
          <div className="flex items-center mb-3">
            <div className="flex items-center flex-1">
              <div className="relative mr-4">
                <div className="h-9 w-9 rounded-full overflow-hidden">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="h-9 w-9 object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{resource.title}</h3>
                <p className="text-xs text-[#E9E7E2]/70 font-oxanium uppercase">{resource.subtitle}</p>
              </div>
            </div>
            
            <button className="h-9 w-9 rounded-full flex items-center justify-center ml-4 bg-[#E9E7E2]/75">
              <ArrowRight className="h-4 w-4 text-[#383741]" />
            </button>
          </div>
          
          <ProgressDisplay 
            progress={resource.progress || 0} 
            showLabel={false} 
            className="mb-3" 
          />
        </div>
        {/* Rationale displayed underneath each resource */}
        <div className="px-4 py-2 text-sm text-[#E9E7E2]/70 font-oxanium mb-4">
          {resource.rationale}
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
          <h1 className="font-libre-baskerville font-bold uppercase text-[#E9E7E2] text-base mb-1">{domain.title}</h1>
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
          
          <div className="space-y-2 mt-8">
            {resources.map((resource, idx) => (
              <ResourceItem key={`${domain.id}-${activeTab}-${idx}`} resource={resource} domainId={domain.id} />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#332e38] text-[#E9E7E2] relative">
      <header className="sticky top-0 z-10 flex items-center pt-4 px-4 bg-[#332e38] text-[#E9E7E2]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BECOME WHO YOU ARE
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none">
              <SlidersHorizontal className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#332e38] border-[#47414d] text-[#E9E7E2]">
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
      
      {isLoading && (
        <div className="p-6 text-center">
          <p>Loading profile data...</p>
        </div>
      )}
    </div>
  );
};

export default BecomeWhoYouAre;
