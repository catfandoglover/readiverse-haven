
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Lock, ArrowRight, Hexagon, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ProgressDisplay } from "@/components/reader/ProgressDisplay";
import { getProgressLevel, getStageName } from "@/components/reader/MasteryScore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Use the same fixed assessment ID as in DomainDetail
const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

interface DNAAnalysisResult {
  [key: string]: string | null;
}

// Helper function to get hex color based on score level
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

const IntellectualDNAExam: React.FC = () => {
  const navigate = useNavigate();
  const [domainFilter, setDomainFilter] = useState<string | undefined>(undefined);
  const [domainAnalysis, setDomainAnalysis] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // All domains in order
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
  
  // Filtered domains based on the selected filter
  const filteredDomains = domainFilter && domainFilter !== "all" 
    ? domains.filter(domain => domain.id === domainFilter)
    : domains;
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
          .maybeSingle();
          
        if (data && !error) {
          setDomainAnalysis(data as DNAAnalysisResult);
        } else {
          console.error("Error fetching domain analysis:", error);
        }
      } catch (e) {
        console.error("Exception fetching domain analysis:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomainData();
  }, []);
  
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
        status: "locked" // Default status
      });
    }
    
    const resources = [];
    
    // Mock progress values for visualization - some with scores, some without
    const dummyProgressValues = [85, 65, 0, 0, 0];
    const dummyScores = [5, 3, 0, 0, 0]; // 0 means no score yet (show grayed out badge)
    
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
      
      // Add status for visual distinction
      let status = "locked";
      if (i === 1) status = "completed";
      else if (i === 2) status = "active";
      else status = "locked";
      
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
  
  // Render a resource item with its status icon, matching the ExamsList style
  const ResourceItem = ({ resource, domainId }: { resource: any, domainId: string }) => {
    let StatusIcon = () => <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />;
    
    if (resource.status === "completed") {
      StatusIcon = () => <Check className="h-5 w-5 text-[#1A1A1A]" />;
    } else if (resource.status === "locked") {
      StatusIcon = () => <Lock className="h-4 w-4 text-[#E9E7E2]/70" />;
    }
    
    // Apply the ExamsList card styling
    return (
      <div 
        className="rounded-2xl p-4 pb-1.5 shadow-inner cursor-pointer hover:bg-[#373763]/70 transition-colors"
        style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(55, 55, 99, 0.1))' }}
      >
        <div className="flex items-center mb-3">
          <div className="flex items-center flex-1">
            <div className="relative mr-4">
              <Hexagon className="h-10 w-10 text-[#3D3D6F]" strokeWidth={3} />
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={resource.image} 
                  alt={resource.title}
                  className="h-9 w-9 object-cover rounded-2xl"
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
          
          {/* Badge display with score, gray out if no score */}
          <div className="relative flex flex-col items-center min-w-[80px]">
            <div className="relative flex flex-col items-center justify-center">
              {/* Hexagon with solid fill */}
              <div 
                style={{ 
                  height: '2rem', 
                  width: '2rem', 
                  position: 'relative',
                  opacity: resource.score > 0 ? 1 : 0.1 // Gray out badges if no score
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  height="100%" 
                  width="100%" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill={getHexagonColor(resource.score > 0 ? resource.score : 1)} 
                  stroke="none" 
                  strokeWidth="0" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="m21 16.2-9 5.1-9-5.1V7.8l9-5.1 9 5.1v8.4Z"></path>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#000000]">
                  {resource.score > 0 ? resource.score : 1}
                </span>
              </div>
              <span 
                className="text-xs font-oxanium mt-1 whitespace-nowrap" 
                style={{ 
                  color: getHexagonColor(resource.score > 0 ? resource.score : 1),
                  opacity: resource.score > 0 ? 1 : 0.1 // Gray out stage name if no score
                }}
              >
                {getStageName(resource.score > 0 ? resource.score : 1)}
              </span>
            </div>
          </div>
        </div>
        
        <ProgressDisplay 
          progress={resource.progress || 0} 
          showLabel={false} 
          className="mb-3" 
        />
      </div>
    );
  };
  
  // Render a domain section
  const DomainSection = ({ domain }: { domain: any }) => {
    const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
    const kindredResources = getResourcesForTab(domain.id, "kindred");
    const challengingResources = getResourcesForTab(domain.id, "challenging");
    const resources = activeTab === "kindred" ? kindredResources : challengingResources;
    
    return (
      <div id={`domain-${domain.id}`} className="min-h-screen pt-6 pb-10" style={{ backgroundColor: domain.color }}>
        <div className="px-6">
          <h1 className="font-baskerville uppercase text-[#E9E7E2] text-base mb-1">{domain.title}</h1>
          <p className="font-baskerville text-[#E9E7E2] mb-4 opacity-[0.35]">{domain.subtitle}</p>
          <p className="font-oxanium text-[#E9E7E2] opacity-[0.5] mb-10">
            {getDomainIntroduction(domain.id)}
          </p>
          
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
      <header className="sticky top-0 z-10 px-6 py-4 flex justify-between items-center bg-[#3D3D6F]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/exam-room")}
          className="p-0 h-auto w-auto hover:bg-transparent"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        
        <h1 className="text-sm font-oxanium uppercase font-bold text-[#E9E7E2]">Intellectual DNA</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0 h-auto w-auto hover:bg-transparent">
              <SlidersHorizontal className="h-6 w-6 text-[#E9E7E2]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#373763] border-[#4D4D8F] text-[#E9E7E2]">
            <DropdownMenuItem 
              onClick={() => setDomainFilter("all")}
              className="flex items-center cursor-pointer"
            >
              {!domainFilter || domainFilter === "all" ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <div className="w-4 mr-2" />
              )}
              All Domains
            </DropdownMenuItem>
            
            {domains.map(domain => (
              <DropdownMenuItem 
                key={domain.id} 
                onClick={() => setDomainFilter(domain.id)}
                className="flex items-center cursor-pointer"
              >
                {domainFilter === domain.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <div className="w-4 mr-2" />
                )}
                {domain.title.charAt(0) + domain.title.slice(1).toLowerCase()}
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
    </div>
  );
};

export default IntellectualDNAExam;
