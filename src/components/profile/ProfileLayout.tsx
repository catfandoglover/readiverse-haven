
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import DomainsList from "./DomainsList";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import MainMenu from "../navigation/MainMenu";
import { ArrowRight, Hexagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DNAAnalysisResult {
  id: string;
  assessment_id: string;
  archetype: string | null;
  introduction: string | null;
  most_kindred_spirit: string | null;
  most_challenging_voice: string | null;
  key_tension_1: string | null;
  key_tension_2: string | null;
  key_tension_3: string | null;
  natural_strength_1: string | null;
  natural_strength_2: string | null;
  natural_strength_3: string | null;
  growth_edges_1: string | null;
  growth_edges_2: string | null;
  growth_edges_3: string | null;
  become_who_you_are: string | null;
  conclusion: string | null;
  next_steps: string | null;
  created_at: string;
}

const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

interface ProfileLayoutProps {
  initialTab?: "become" | "profile";
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ initialTab }) => {
  const [activeSection, setActiveSection] = useState<"become" | "profile">(initialTab || "profile");
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [isLoadingIntroduction, setIsLoadingIntroduction] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionChange = (section: "become" | "profile") => {
    setActiveSection(section);
  };

  useEffect(() => {
    const fetchDNAAnalysisResult = async () => {
      try {
        setIsLoadingIntroduction(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('id, assessment_id, archetype, introduction, most_kindred_spirit, most_challenging_voice, key_tension_1, key_tension_2, key_tension_3, natural_strength_1, natural_strength_2, natural_strength_3, growth_edges_1, growth_edges_2, growth_edges_3, become_who_you_are, conclusion, next_steps, created_at')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
          .maybeSingle();
          
        if (data && !error) {
          console.log("DNA analysis result:", data);
          setAnalysisResult(data as DNAAnalysisResult);
        } else {
          console.error("Error fetching DNA analysis result:", error);
        }
      } catch (e) {
        console.error("Exception fetching DNA analysis result:", e);
      } finally {
        setIsLoadingIntroduction(false);
      }
    };
    
    fetchDNAAnalysisResult();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden relative">
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute top-4 left-4 z-40">
          <MainMenu />
        </div>
        
        <ProfileHeader />
        
        <div className="px-6 mt-16 mb-6 relative z-1 pt-4">
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
                {isLoadingIntroduction ? (
                  <span className="inline-block">Loading wisdom guidance...</span>
                ) : (
                  analysisResult?.become_who_you_are || 
                  "Trust your capacity to be both mystic and philosopher, knowing that wisdom often emerges from holding these tensions with grace."
                )}
              </p>
              
              <DomainsList />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-oxanium text-[#E9E7E2]/80 mb-4">
                {isLoadingIntroduction ? (
                  <span className="inline-block">Loading your intellectual profile...</span>
                ) : (
                  analysisResult?.introduction || 
                  "You are a philosophical bridge-builder who approaches meaning through careful synthesis of multiple viewpoints. Your approach combines analytical precision with an openness to paradox, allowing you to hold seemingly contradictory truths in productive tension."
                )}
              </p>
              
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
                    <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                      {isLoadingIntroduction ? (
                        <span className="inline-block">Loading...</span>
                      ) : (
                        analysisResult?.most_kindred_spirit || "FRIEDRICH NIETZSCHE"
                      )}
                    </h3>
                    <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Kindred Spirit</p>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                </button>
              </div>
              
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
                    <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                      {isLoadingIntroduction ? (
                        <span className="inline-block">Loading...</span>
                      ) : (
                        analysisResult?.most_challenging_voice || "MARTIN HEIDEGGER"
                      )}
                    </h3>
                    <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Most Challenging Voice</p>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                </button>
              </div>
              
              <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3  font-bold">Key Tensions</h2>
              <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80 mb-6">
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.key_tension_1 || 
                    "Navigates between empirical evidence and subjective experience, seeking to honor both without reducing either to the other"
                  )}
                </li>
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.key_tension_2 || 
                    "Balances individual expression with communal values, searching for ways personal autonomy can enrich rather than threaten collective flourishing"
                  )}
                </li>
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.key_tension_3 || 
                    "Wrestles with tradition and innovation, drawing wisdom from historical insights while remaining open to emergent understanding"
                  )}
                </li>
              </ul>
              
              <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3  font-bold">Natural Strengths</h2>
              <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80 mb-6">
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.natural_strength_1 || 
                    "Excels at finding practical synthesis between competing philosophical frameworks without oversimplifying their distinctions"
                  )}
                </li>
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.natural_strength_2 || 
                    "Maintains intellectual humility while pursuing rigorous understanding, recognizing the limitations of human comprehension"
                  )}
                </li>
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.natural_strength_3 || 
                    "Integrates diverse cultural and historical perspectives into a coherent worldview that respects pluralism"
                  )}
                </li>
              </ul>
              
              <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3  font-bold">Growth Edges</h2>
              <ul className="list-disc pl-5 space-y-2 font-oxanium text-[#E9E7E2]/80 mb-6">
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.growth_edges_1 || 
                    "Accept the inherent uncertainty in complex philosophical questions without retreating to premature resolution"
                  )}
                </li>
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.growth_edges_2 || 
                    "Develop more comfort with productive tension as a source of creativity rather than a problem to be solved"
                  )}
                </li>
                <li>
                  {isLoadingIntroduction ? (
                    <span className="inline-block">Loading...</span>
                  ) : (
                    analysisResult?.growth_edges_3 || 
                    "Expand your engagement with philosophical traditions that challenge your preference for practical reconciliation"
                  )}
                </li>
              </ul>
              
              <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3  font-bold">Conclusion</h2>
              <p className="font-oxanium text-[#E9E7E2]/80 mb-6">
                {isLoadingIntroduction ? (
                  <span className="inline-block">Loading...</span>
                ) : (
                  analysisResult?.conclusion || 
                  "Your intellectual DNA reveals a mind that seeks meaningful synthesis across different domains of knowledge, valuing both analytical precision and intuitive understanding. As you continue to develop your philosophical perspective, embrace the productive tensions that arise between different ways of knowing."
                )}
              </p>
              
              <h2 className="text-base text-[#E9E7E2] font-oxanium uppercase mb-3  font-bold">Next Steps</h2>
              <p className="font-oxanium text-[#E9E7E2]/80 mb-6">
                {isLoadingIntroduction ? (
                  <span className="inline-block">Loading...</span>
                ) : (
                  analysisResult?.next_steps || 
                  "Consider exploring philosophical traditions that challenge your comfort zone, particularly those that value paradox and ambiguity as ends in themselves rather than problems to be solved. Engage with thinkers whose approaches differ most from your own, allowing their perspectives to enrich your intellectual journey."
                )}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;
