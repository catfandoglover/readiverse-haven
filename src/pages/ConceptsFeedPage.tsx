
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConceptsContent from "@/components/discover/ConceptsContent";
import { useNavigationState } from "@/hooks/useNavigationState";

const ConceptsFeedPage = () => {
  const navigate = useNavigate();
  const { saveSourcePath } = useNavigationState();
  const [detailedViewVisible, setDetailedViewVisible] = React.useState(false);
  
  React.useEffect(() => {
    // Save the current page path (not search page) as the source path for proper back navigation
    saveSourcePath(window.location.pathname);
  }, [saveSourcePath]);
  
  const handleBack = () => {
    navigate('/discover/search');
  };
  
  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      {!detailedViewVisible && (
        <div className="flex items-center pt-4 px-4 absolute top-0 left-0 right-0 z-10">
          <button
            onClick={handleBack}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 transition-colors drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="font-oxanium uppercase text-sm font-bold tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
              CONCEPTS
            </h1>
          </div>
          <div className="w-10"></div> {/* Empty space to balance the layout */}
        </div>
      )}
      
      <main className="flex-1 relative overflow-hidden">
        <div className="w-full h-full relative">
          <div className="w-full h-full absolute inset-0">
            <ConceptsContent 
              currentIndex={0}
              onDetailedViewShow={() => setDetailedViewVisible(true)}
              onDetailedViewHide={() => setDetailedViewVisible(false)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptsFeedPage;
