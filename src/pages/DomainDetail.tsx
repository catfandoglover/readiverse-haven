
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";

const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
  
  // Mock data for the domain details
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
        title: "THEOLOGY", // Using THEOLOGY as shown in the image
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
    
    return domains[id] || domains["theology"]; // Default to theology if not found
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
        <Button 
          variant="ghost" 
          className="text-[#E9E7E2] uppercase tracking-wider font-oxanium uppercase text-xs hover:bg-transparent"
        >
          TAKE COURSE
        </Button>
      </header>
      
      <main className="px-6 pb-6">
        <div className="mb-10">
          <h1 className="text-xl font-baskerville uppercase text-[#E9E7E2] mb-1">{domainData.title}</h1>
          <p className="font-baskerville text-[#E9E7E2] mb-6 opacity-[0.35]">{domainData.subtitle}</p>
          <p className="font-oxanium text-[#E9E7E2] opacity-[0.5]">
            {domainData.description}
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex border-b border-white/20">
            <button 
              className={`pb-3 mr-10 uppercase tracking-wider font-medium ${activeTab === "kindred" ? "border-b-2 border-white" : "opacity-70"}`}
              onClick={() => setActiveTab("kindred")}
            >
              KINDRED SPIRITS
            </button>
            <button 
              className={`pb-3 uppercase tracking-wider font-medium ${activeTab === "challenging" ? "border-b-2 border-white" : "opacity-70"}`}
              onClick={() => setActiveTab("challenging")}
            >
              CHALLENGING VOICES
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {domainData.resources.map((resource, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between bg-[#383741] rounded-full p-2 pr-4">
                <div className="flex items-center">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-white font-medium">{resource.title}</h3>
                    <p className="text-[#9F9EA1] text-sm">{resource.subtitle}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-white/20 rounded-full h-10 w-10 hover:bg-white/30"
                >
                  <ArrowRight className="h-5 w-5 text-white" />
                </Button>
              </div>
              <p className="text-[#9F9EA1] mt-2 mb-6 ml-2">{resource.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DomainDetail;
