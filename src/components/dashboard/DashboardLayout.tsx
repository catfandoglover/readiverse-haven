
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../discover/BottomNav";
import ProfileHeader from "./ProfileHeader";
import DomainsList from "./DomainsList";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const DashboardLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"become" | "profile">("profile");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionChange = (section: "become" | "profile") => {
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      <main className="flex-1 relative pb-[50px] overflow-y-auto">
        <ProfileHeader />
        
        <div className="px-6 mt-4 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0",
                activeSection === "profile" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleSectionChange("profile")}
            >
              PROFILE
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start",
                activeSection === "become" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleSectionChange("become")}
            >
              BECOME WHO YOU ARE
            </Button>
          </div>
          
          {activeSection === "become" ? (
            <div className="space-y-4">
              <p className="text-lg font-baskerville text-[#E9E7E2] mb-6">
                Trust your capacity to be both mystic and philosopher, knowing that wisdom often emerges from holding these tensions with grace
              </p>
              
              <DomainsList />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#383741] shadow-inner">
              <h2 className="text-xl font-serif mb-3">Your Profile</h2>
              <p className="font-baskerville text-[#E9E7E2]/80 mb-4">
                Explore your intellectual profile and personalized areas of knowledge. Your profile represents your unique perspective on fundamental questions of human existence.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav activeTab="dashboard" />
      </div>
    </div>
  );
};

export default DashboardLayout;
