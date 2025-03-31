
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import ExamHeader from "@/components/exam/ExamHeader";
import LastExamHero from "@/components/exam/LastExamHero";
import SuggestedExamHero from "@/components/exam/SuggestedExamHero";
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
        {/* Main content area with consistent padding */}
        <div className="px-4 flex flex-col gap-4">
          {/* Hero section - responsive layout */}
          {user && (
            isMobile ? (
              // Mobile layout - only show last exam
              <div className="w-full">
                <LastExamHero />
              </div>
            ) : (
              // Desktop layout - side by side heroes
              <div className="grid grid-cols-2 gap-4">
                <LastExamHero />
                <SuggestedExamHero />
              </div>
            )
          )}
          
          {/* Exam cards section */}
          <div className="grid grid-cols-2 gap-4">
            <IntellectualDNAExamCard />
            <CreateYourOwnExamCard />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-visible">
            <ExamsList />
          </div>
        </div>
        
        {/* Extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ExamRoom;
