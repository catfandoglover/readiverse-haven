
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import ExamHeader from "@/components/exam/ExamHeader";
import LastExamHero from "@/components/exam/LastExamHero";
import ExamsList from "@/components/exam/ExamsList";
import IntellectualDNAExamCard from "@/components/exam/IntellectualDNAExamCard";
import CreateYourOwnExamCard from "@/components/exam/CreateYourOwnExamCard";
import { useIsMobile } from "@/hooks/use-mobile";

const ExamRoom: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Save current path to navigation history
  React.useEffect(() => {
    // Updated the first parameter to match one of the expected values from the type definition
    saveLastVisited('bookshelf', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen h-full bg-[#3D3D6F] text-[#E9E7E2]">
      {/* Header */}
      <ExamHeader className="sticky top-0 z-10" />
      
      {/* Scrollable container for the rest of the content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Hero section and Exam cards - responsive layout */}
        {user && (
          isMobile ? (
            // Mobile layout (stacked)
            <>
              <LastExamHero />
              <div className="px-4 pt-2 pb-4">
                <IntellectualDNAExamCard />
              </div>
              <div className="px-4 pb-4">
                <CreateYourOwnExamCard />
              </div>
            </>
          ) : (
            // Desktop layout (two columns for hero and DNA exam, full width for create your own)
            <>
              <div className="grid grid-cols-2 gap-6 px-6 pt-6 pb-3">
                <LastExamHero />
                <IntellectualDNAExamCard />
              </div>
              <div className="px-6 pb-6">
                <CreateYourOwnExamCard />
              </div>
            </>
          )
        )}
        
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-visible">
          <ExamsList />
        </div>
        
        {/* Extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ExamRoom;
