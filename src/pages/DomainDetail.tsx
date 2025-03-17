import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
  
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
      "philosophy": {
        title: "PHILOSOPHY",
        subtitle: "Your view on the Divine.",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight."
        })
      },
      "literature": {
        title: "LITERATURE",
        subtitle: "Your view on the Divine.",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
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
        subtitle: "Your view on the Divine.",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight."
        })
      },
      "theology": {
        title: "THEOLOGY",
        subtitle: "Your view on the Divine.",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight."
        })
      },
      "ethics": {
        title: "THEOLOGY",
        subtitle: "Your view on the Divine.",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
        resources: Array(5).fill({
          id: "origin",
          image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
          title: "ORIGIN",
          subtitle: "DE PRINCIPIIS (230)",
          description: "Divine truth requires both rational inquiry and mystical insight."
        })
      },
      "history": {
        title: "HISTORY",
        subtitle: "Your view on the Divine.",
        description: "Seeks experiential knowledge while maintaining rational frameworks.",
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
            {domainData.description}
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
              <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <Hexagon className="h-12 w-12 text-[#CCFF23]" strokeWidth={3} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={resource.image} 
                        alt={resource.title}
                        className="h-12 w-12 object-cover"
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
                <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                </button>
              </div>
              <p className="text-xs text-[#9F9EA1] mt-2 mb-6 ml-2 font-oxanium">{resource.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DomainDetail;
