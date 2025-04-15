import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import DomainsList from "./DomainsList";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import MainMenu from "../navigation/MainMenu";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";

interface ProfileLayoutProps {
  initialTab?: "become" | "profile";
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { dnaAnalysisData, isLoading, getIconByName } = useProfileData();
  
  const handleBecomeWhoYouAreClick = () => {
    navigate('/become-who-you-are');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <main className="flex-1">
        <div className="absolute top-4 left-4 z-20">
          <MainMenu />
        </div>
        
        <div className="relative">
          <ProfileHeader />
          
          <div 
            className="px-6 mb-6 relative" 
            style={{ 
              marginTop: '80px',
              position: 'relative', 
              zIndex: 5 
            }}
          >
            <p className="font-oxanium text-[#E9E7E2]/80 mb-6">
              {isLoading ? (
                <span className="inline-block">Loading your intellectual profile...</span>
              ) : (
                dnaAnalysisData?.introduction || ""
              )}
            </p>
            
            <div className="space-y-3 mb-6">
              <div 
                className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between cursor-pointer hover:bg-[#383741]"
                onClick={handleBecomeWhoYouAreClick}
              >
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className="h-9 w-9 rounded-full overflow-hidden">
                      <img 
                        src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8" 
                        alt="Lightning" 
                        className="h-9 w-9 object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                      BECOME WHO YOU ARE
                    </h3>
                    <p className="text-xs text-[#E9E7E2]/70 font-oxanium uppercase">YOUR POTENTIAL</p>
                  </div>
                </div>
                <button className="h-9 w-9 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                </button>
              </div>
              
              {(isLoading || dnaAnalysisData?.most_kindred_spirit) && (
                <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <div className="h-9 w-9 rounded-full overflow-hidden">
                        <img 
                          src={isLoading ? "" : getIconByName(dnaAnalysisData?.most_kindred_spirit)} 
                          alt={isLoading ? "Loading" : dnaAnalysisData?.most_kindred_spirit?.split(' - ')[0] || "Kindred Spirit"} 
                          className="h-9 w-9 object-cover"
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
                      <p className="text-xs text-[#E9E7E2]/70 font-oxanium uppercase">MOST KINDRED SPIRIT</p>
                    </div>
                  </div>
                  <button className="h-9 w-9 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                  </button>
                </div>
              )}
              
              {(isLoading || dnaAnalysisData?.most_challenging_voice) && (
                <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <div className="h-9 w-9 rounded-full overflow-hidden">
                        <img 
                          src={isLoading ? "" : getIconByName(dnaAnalysisData?.most_challenging_voice)} 
                          alt={isLoading ? "Loading" : dnaAnalysisData?.most_challenging_voice?.split(' - ')[0] || "Challenging Voice"} 
                          className="h-9 w-9 object-cover"
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
                      <p className="text-xs text-[#E9E7E2]/70 font-oxanium uppercase">MOST CHALLENGING VOICE</p>
                    </div>
                  </div>
                  <button className="h-9 w-9 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                  </button>
                </div>
              )}
            </div>
            
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
            
            <div className="pt-4 pb-12">
              <Button 
                variant="destructive"
                className="w-full h-[52px] rounded-2xl bg-[#e9e7e2] text-[#332e38] hover:bg-[#e9e7e2]/90 font-oxanium uppercase text-sm font-bold"
                onClick={signOut}
              >
                SIGN OUT
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;
