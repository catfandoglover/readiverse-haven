
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  
  // This would be fetched from an API in a real implementation
  const getProfileAreaTitle = (id: string) => {
    const profileAreas: Record<string, string> = {
      "philosophy": "Philosophy",
      "literature": "Literature",
      "politics": "Politics",
      "theology": "Theology",
      "ethics": "Ethics",
      "history": "History"
    };
    
    return profileAreas[id] || "Profile Area";
  };
  
  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <header className="px-4 py-3 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-serif">{getProfileAreaTitle(domainId || "")}</h1>
      </header>
      
      <main className="p-4">
        <div className="rounded-xl bg-[#383741] p-4 mb-4">
          <h2 className="text-lg font-serif mb-2">About this Profile Area</h2>
          <p className="text-[#E9E7E2]/80 font-baskerville">
            This is the {getProfileAreaTitle(domainId || "")} profile area. Here you will find resources, 
            assessments, and guidance related to this intellectual domain.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-xl bg-[#383741] p-4">
            <h3 className="text-md font-serif mb-2">Recommended Resources</h3>
            <p className="text-sm text-[#E9E7E2]/70">
              Content for this profile area is coming soon.
            </p>
          </div>
          
          <div className="rounded-xl bg-[#383741] p-4">
            <h3 className="text-md font-serif mb-2">Your Progress</h3>
            <p className="text-sm text-[#E9E7E2]/70">
              Your profile area progress details will appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DomainDetail;
