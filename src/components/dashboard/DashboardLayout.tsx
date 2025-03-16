
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import DomainsList from "./DomainsList";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import MainMenu from "../navigation/MainMenu";

const DashboardLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"become" | "profile">("profile");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionChange = (section: "become" | "profile") => {
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute top-4 left-4 z-10">
          <MainMenu />
        </div>
        
        <ProfileHeader />
        
        <div className="px-6 mt-4 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0",
                activeSection === "profile" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleSectionChange("profile")}
            >
              <span className={cn(
                "relative",
                activeSection === "profile" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
              )}>
                PROFILE
              </span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0",
                activeSection === "become" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleSectionChange("become")}
            >
              <span className={cn(
                "relative",
                activeSection === "become" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
              )}>
                BECOME WHO YOU ARE
              </span>
            </Button>
          </div>
          
          {activeSection === "become" ? (
            <div className="space-y-4">
              <p className="font-oxanium text-[#E9E7E2]/80 mb-4">
                Trust your capacity to be both mystic and philosopher, knowing that wisdom often emerges from holding these tensions with grace.
              </p>
              
              <DomainsList />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-oxanium text-[#E9E7E2]/80 mb-4">
                You are a philosophical bridge-builder who approaches meaning through careful synthesis of multiple viewpoints. Your approach combines analytical precision with an openness to paradox, allowing you to hold seemingly contradictory truths in productive tension.
              </p>
              
              {/* Key Tensions Section */}
              <div className="p-4 rounded-xl bg-[#383741] shadow-inner">
                <h2 className="text-xl font-oxanium uppercase mb-3">Key Tensions</h2>
                <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80">
                  <li>Navigates between empirical evidence and subjective experience, seeking to honor both without reducing either to the other</li>
                  <li>Balances individual expression with communal values, searching for ways personal autonomy can enrich rather than threaten collective flourishing</li>
                  <li>Wrestles with tradition and innovation, drawing wisdom from historical insights while remaining open to emergent understanding</li>
                </ul>
              </div>
              
              {/* Natural Strengths Section */}
              <div className="p-4 rounded-xl bg-[#383741] shadow-inner">
                <h2 className="text-xl font-oxanium uppercase mb-3">Natural Strengths</h2>
                <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80">
                  <li>Excels at finding practical synthesis between competing philosophical frameworks without oversimplifying their distinctions</li>
                  <li>Maintains intellectual humility while pursuing rigorous understanding, recognizing the limitations of human comprehension</li>
                  <li>Integrates diverse cultural and historical perspectives into a coherent worldview that respects pluralism</li>
                </ul>
              </div>
              
              {/* Growth Edges Section */}
              <div className="p-4 rounded-xl bg-[#383741] shadow-inner">
                <h2 className="text-xl font-oxanium uppercase mb-3">Growth Edges</h2>
                <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80">
                  <li>Accept the inherent uncertainty in complex philosophical questions without retreating to premature resolution</li>
                  <li>Develop more comfort with productive tension as a source of creativity rather than a problem to be solved</li>
                  <li>Expand your engagement with philosophical traditions that challenge your preference for practical reconciliation</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
