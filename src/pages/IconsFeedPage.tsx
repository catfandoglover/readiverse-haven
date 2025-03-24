
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconsContent from "@/components/discover/IconsContent";

const IconsFeedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      <header 
        className="bg-[#2A282A]/40 backdrop-blur-sm"
        style={{
          aspectRatio: "1290/152",
          maxHeight: "152px"
        }}
      >
        <div className="flex items-center px-4 py-3 h-full w-full">
          <button
            onClick={() => navigate('/discover/search')}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="font-oxanium uppercase text-xs tracking-wider">ICONS</h1>
          </div>
          <div className="w-10"></div> {/* Empty space to balance the layout */}
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
        <div className="w-full h-full relative">
          <div className="w-full h-full absolute inset-0">
            <IconsContent 
              currentIndex={0}
              onDetailedViewShow={() => {}}
              onDetailedViewHide={() => {}}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IconsFeedPage;
