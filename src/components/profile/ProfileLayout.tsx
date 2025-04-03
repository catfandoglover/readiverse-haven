import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import DomainsList from "./DomainsList";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import MainMenu from "../navigation/MainMenu";
import { ArrowRight, Hexagon, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";
import ProfileDebug from "./ProfileDebug";

interface ProfileLayoutProps {
  initialTab?: "become" | "profile";
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ initialTab }) => {
  const [activeSection, setActiveSection] = useState<"become" | "profile">(initialTab || "profile");
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { dnaAnalysisData, isLoading, getIconByName } = useProfileData();
  
  const handleSectionChange = (section: "become" | "profile") => {
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        <div className="absolute top-4 left-4 z-20">
          <MainMenu />
        </div>
        
        <div className="overflow-visible relative">
          <ProfileHeader />
          
          <div 
            className="px-6 mb-6 relative" 
            style={{ 
              marginTop: '46px',
              position: 'relative', 
              zIndex: 5 
            }}
          >
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
                  {isLoading ? (
                    <span className="inline-block">Loading wisdom guidance...</span>
                  ) : (
                    dnaAnalysisData?.become_who_you_are || ""
                  )}
                </p>
                
                <DomainsList />
                
                {/* Logout Button */}
                <div className="pt-8 pb-12">
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent border border-[#E9E7E2]/20 text-[#E9E7E2]/80 hover:bg-[#E9E7E2]/10 hover:text-[#E9E7E2] transition-colors"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="font-oxanium">Logout</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-oxanium text-[#E9E7E2]/80 mb-4">
                  {isLoading ? (
                    <span className="inline-block">Loading your intellectual profile...</span>
                  ) : (
                    dnaAnalysisData?.introduction || ""
                  )}
                </p>
                
                {/* Only show kindred spirit if data exists */}
                {(isLoading || dnaAnalysisData?.most_kindred_spirit) && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={isLoading ? "" : getIconByName(dnaAnalysisData?.most_kindred_spirit)} 
                            alt={isLoading ? "Loading" : dnaAnalysisData?.most_kindred_spirit?.split(' - ')[0] || "Kindred Spirit"} 
                            className="h-10 w-10 object-cover"
                            style={{ 
                              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {isLoading ? (
                            <span className="inline-block">Loading...</span>
                          ) : (
                            dnaAnalysisData?.most_kindred_spirit?.split(' - ')[0] || ""
                          )}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Kindred Spirit</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                
                {/* Only show challenging voice if data exists */}
                {(isLoading || dnaAnalysisData?.most_challenging_voice) && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={isLoading ? "" : getIconByName(dnaAnalysisData?.most_challenging_voice)} 
                            alt={isLoading ? "Loading" : dnaAnalysisData?.most_challenging_voice?.split(' - ')[0] || "Challenging Voice"} 
                            className="h-10 w-10 object-cover"
                            style={{ 
                              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {isLoading ? (
                            <span className="inline-block">Loading...</span>
                          ) : (
                            dnaAnalysisData?.most_challenging_voice?.split(' - ')[0] || ""
                          )}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Challenging Voice</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                
                <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3 font-bold">Key Tensions</h2>
                <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80 mb-6">
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.key_tension_1 || ""
                    )}
                  </li>
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.key_tension_2 || ""
                    )}
                  </li>
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.key_tension_3 || ""
                    )}
                  </li>
                </ul>
                
                <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3 font-bold">Natural Strengths</h2>
                <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80 mb-6">
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.natural_strength_1 || ""
                    )}
                  </li>
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.natural_strength_2 || ""
                    )}
                  </li>
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.natural_strength_3 || ""
                    )}
                  </li>
                </ul>
                
                <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3 font-bold">Growth Edges</h2>
                <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80 mb-6">
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.growth_edges_1 || ""
                    )}
                  </li>
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.growth_edges_2 || ""
                    )}
                  </li>
                  <li>
                    {isLoading ? (
                      <span className="inline-block">Loading...</span>
                    ) : (
                      dnaAnalysisData?.growth_edges_3 || ""
                    )}
                  </li>
                </ul>
                
                <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3 font-bold">Conclusion</h2>
                <p className="font-oxanium text-[#E9E7E2]/80 mb-8">
                  {isLoading ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    dnaAnalysisData?.conclusion || ""
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add ProfileDebug component */}
      <ProfileDebug />
    </div>
  );
};

export default ProfileLayout;
