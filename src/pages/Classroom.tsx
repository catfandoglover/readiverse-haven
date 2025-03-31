
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import ClassroomHeader from "@/components/classroom/ClassroomHeader";
import LastCourseHero from "@/components/classroom/LastCourseHero";
import SuggestedCourseHero from "@/components/classroom/SuggestedCourseHero";
import CoursesList from "@/components/classroom/CoursesList";
import IntellectualDNACourseCard from "@/components/classroom/IntellectualDNACourseCard";
import CreateYourOwnCourseCard from "@/components/classroom/CreateYourOwnCourseCard";
import { useIsMobile } from "@/hooks/use-mobile";

const Classroom: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Save current path to navigation history
  React.useEffect(() => {
    saveLastVisited('classroom', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen h-full bg-[#1D3A35] text-[#E9E7E2]">
      {/* Header */}
      <ClassroomHeader className="sticky top-0 z-10" />
      
      {/* Scrollable container for the rest of the content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Main content area with consistent padding */}
        <div className="px-4 flex flex-col gap-4">
          {/* Hero section - responsive layout */}
          {user && (
            isMobile ? (
              // Mobile layout - stacked
              <div className="w-full">
                <LastCourseHero />
              </div>
            ) : (
              // Desktop layout - side by side
              <div className="grid grid-cols-2 gap-4">
                <LastCourseHero />
                <SuggestedCourseHero />
              </div>
            )
          )}
          
          {/* Course cards section */}
          <div className="grid grid-cols-2 gap-4">
            <IntellectualDNACourseCard />
            <CreateYourOwnCourseCard />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-visible">
            <CoursesList />
          </div>
        </div>
        
        {/* Extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Classroom;
