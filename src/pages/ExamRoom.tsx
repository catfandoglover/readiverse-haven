
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import ExamHeader from "@/components/exam/ExamHeader";
import LastExamHero from "@/components/exam/LastExamHero";
import ExamsList from "@/components/exam/ExamsList";
import IntellectualDNAExamCard from "@/components/exam/IntellectualDNAExamCard";
import CreateYourOwnExamCard from "@/components/exam/CreateYourOwnExamCard";

const ExamRoom: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('exam', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen h-full bg-[#3D3D6F] text-[#E9E7E2]">
      {/* Header */}
      <ExamHeader className="sticky top-0 z-10" />
      
      {/* Scrollable container for the rest of the content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Hero section */}
        {user && <LastExamHero />}
        
        {/* Exam cards section */}
        <div className="px-4 pt-2 pb-4 grid grid-cols-2 gap-4">
          <IntellectualDNAExamCard />
          <CreateYourOwnExamCard />
        </div>
        
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
