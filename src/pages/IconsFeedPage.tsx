import React, { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconsContent from "@/components/discover/IconsContent";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useIsMobile } from "@/hooks/use-mobile";

const IconsFeedPage = () => {
  const navigate = useNavigate();
  const { saveSourcePath } = useNavigationState();
  const [detailedViewVisible, setDetailedViewVisible] = useState(false);
  const isMobile = useIsMobile();
  
  // Force check mobile detection on mount
  useEffect(() => {
    console.log("[IconsFeedPage] Mobile detection:", isMobile);
  }, [isMobile]);
  
  useEffect(() => {
    // Save the current page path as the source path for proper back navigation
    saveSourcePath(window.location.pathname);
  }, [saveSourcePath]);
  
  const handleBack = () => {
    navigate('/discover/search');
  };
  
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#2A282A]">
      {!detailedViewVisible && (
        <div className="flex items-center pt-4 px-4 absolute top-0 left-0 right-0 z-10">
          <button
            onClick={handleBack}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
            aria-label="Back"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <h1 className={`font-oxanium uppercase ${isMobile ? 'text-sm' : 'text-base'} font-bold tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] text-[#E9E7E2]`}>
              ICONS
            </h1>
          </div>
          <button 
            className={`h-10 w-10 inline-flex items-center justify-center rounded-md ${isMobile ? 'text-[#E9E7E2]' : 'text-[#332E38]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#332E38] focus:ring-offset-[#2A282A] transition-colors`}
            aria-label="Search"
            onClick={() => navigate('/discover/search')}
          >
            <Search className="h-6 w-6" />
          </button>
        </div>
      )}
      
      <main className="flex-1 relative">
        <div className="w-full h-full absolute inset-0">
          <IconsContent 
            currentIndex={0}
            onDetailedViewShow={() => setDetailedViewVisible(true)}
            onDetailedViewHide={() => setDetailedViewVisible(false)}
          />
        </div>
      </main>
    </div>
  );
};

export default IconsFeedPage;
