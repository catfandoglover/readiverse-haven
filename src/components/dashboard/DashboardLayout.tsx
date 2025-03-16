
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import DomainsList from "./DomainsList";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import MainMenu from "../navigation/MainMenu";
import { ArrowRight, Hexagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"become" | "profile">("profile");
  const [profileIntroduction, setProfileIntroduction] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fixed assessment ID for testing/development
  const FIXED_ASSESSMENT_ID = "7f1944af-a5a9-47ab-abe4-b97b82eb6bd1";
  
  useEffect(() => {
    if (location.state && location.state.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProfileIntroduction = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('introduction')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
          .single();
          
        if (error) {
          console.error("Error fetching profile introduction:", error);
          setError("Failed to load profile data");
          return;
        }
        
        if (data && data.introduction) {
          setProfileIntroduction(data.introduction);
        }
      } catch (err) {
        console.error("Exception fetching profile introduction:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileIntroduction();
  }, [FIXED_ASSESSMENT_ID]);

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
              {loading ? (
                <p className="font-oxanium text-[#E9E7E2]/80 mb-4">Loading profile information...</p>
              ) : error ? (
                <p className="font-oxanium text-[#E9E7E2]/80 mb-4">
                  Unable to load profile information. Please try again later.
                </p>
              ) : (
                <p className="font-oxanium text-[#E9E7E2]/80 mb-4">
                  {profileIntroduction}
                </p>
              )}
              
              {/* Kindred Spirit Section */}
              <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png" 
                        alt="Friedrich Nietzsche" 
                        className="h-10 w-10 object-cover"
                        style={{ 
                          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">FRIEDRICH NIETZSCHE</h3>
                    <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Kindred Spirit</p>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                </button>
              </div>
              
              {/* Challenging Voice Section */}
              <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png" 
                        alt="Martin Heidegger" 
                        className="h-10 w-10 object-cover"
                        style={{ 
                          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">MARTIN HEIDEGGER</h3>
                    <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Challenging Voice</p>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                </button>
              </div>
              
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
