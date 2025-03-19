
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, BookOpen, ArrowRight, MoveLeft, Hexagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import MainMenu from "@/components/navigation/MainMenu";
import { useAuth } from "@/contexts/OutsetaAuthContext";

interface Domain {
  id: string;
  title: string;
  description: string;
  color: string;
}

const domains: Domain[] = [
  {
    id: "ETHICS",
    title: "Ethics",
    description: "Moral principles that govern a person's behavior",
    color: "#CCFF23",
  },
  {
    id: "EPISTEMOLOGY",
    title: "Epistemology",
    description: "The theory of knowledge, especially with regard to its methods",
    color: "#39FF14",
  },
  {
    id: "POLITICS",
    title: "Politics",
    description: "Activities associated with the governance of a country",
    color: "#00FF7F",
  },
  {
    id: "THEOLOGY",
    title: "Theology",
    description: "The study of the nature of God and religious belief",
    color: "#00FFFF",
  },
  {
    id: "ONTOLOGY",
    title: "Ontology",
    description: "The study of the nature of being",
    color: "#7DF9FF",
  },
  {
    id: "AESTHETICS",
    title: "Aesthetics",
    description: "Principles concerned with the nature and appreciation of beauty",
    color: "#B9F2FF",
  },
];

interface DNAAnalysisResult {
  [key: string]: string | null;
}

const DomainDetail = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  const [activePerspective, setActivePerspective] = useState<"kindred" | "challenging">("kindred");
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const { user, supabase: authSupabase } = useAuth();
  
  useEffect(() => {
    const fetchUserAssessmentId = async () => {
      if (!user || !user.Account?.Uid) {
        console.log("No user Account.Uid available:", user);
        return;
      }
      
      try {
        const client = authSupabase || supabase;
        
        console.log("Fetching assessment ID for Outseta Account.Uid:", user.Account.Uid);
        
        // Get the assessment ID directly from dna_assessment_results
        const { data, error } = await client
          .from('dna_assessment_results')
          .select('id')
          .eq('outseta_user_id', user.Account.Uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching assessment ID:", error);
          return;
        }
        
        if (data && data.id) {
          console.log("User assessment ID for domain detail:", data.id);
          setAssessmentId(data.id);
        } else {
          // Fallback to fixed assessment ID for demo purposes
          const fallbackId = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';
          console.log("No assessment ID found, using fallback:", fallbackId);
          setAssessmentId(fallbackId);
        }
      } catch (e) {
        console.error("Exception fetching user assessment ID:", e);
      }
    };
    
    fetchUserAssessmentId();
  }, [user, authSupabase]);
  
  useEffect(() => {
    // Find the active domain based on the URL parameter
    const domain = domains.find(d => d.id === domainId);
    if (domain) {
      setActiveDomain(domain);
    } else {
      navigate("/dashboard");
    }
  }, [domainId, navigate]);
  
  const { data: analysisResults, isLoading } = useQuery({
    queryKey: ['domain-analysis', domainId, assessmentId],
    queryFn: async () => {
      if (!assessmentId) return null;
      
      const { data, error } = await supabase
        .from('dna_analysis_results')
        .select('*')
        .eq('assessment_id', assessmentId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId && !!domainId,
  });

  const kindredSpirit1 = analysisResults?.[`${domainId}_kindred_spirit_1`];
  const kindredSpirit2 = analysisResults?.[`${domainId}_kindred_spirit_2`];
  const kindredSpirit3 = analysisResults?.[`${domainId}_kindred_spirit_3`];
  const kindredSpirit4 = analysisResults?.[`${domainId}_kindred_spirit_4`];
  const kindredSpirit5 = analysisResults?.[`${domainId}_kindred_spirit_5`];
  
  const challengingVoice1 = analysisResults?.[`${domainId}_challenging_voice_1`];
  const challengingVoice2 = analysisResults?.[`${domainId}_challenging_voice_2`];
  const challengingVoice3 = analysisResults?.[`${domainId}_challenging_voice_3`];
  const challengingVoice4 = analysisResults?.[`${domainId}_challenging_voice_4`];
  const challengingVoice5 = analysisResults?.[`${domainId}_challenging_voice_5`];

  if (!activeDomain) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      <header className="w-full p-4 flex items-center">
        <div className="absolute top-4 left-4 z-10">
          <MainMenu />
        </div>
        <Button variant="ghost" className="mr-4" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold font-oxanium uppercase">{activeDomain.title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 ${
                activePerspective === "kindred" ? "text-[#E9E7E2]" : "text-[#E9E7E2]/60"
              }`}
              onClick={() => setActivePerspective("kindred")}
            >
              <span
                className={`relative ${
                  activePerspective === "kindred" &&
                  "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
                }`}
              >
                Kindred Spirits
              </span>
            </Button>
            <Button
              variant="ghost"
              className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 ${
                activePerspective === "challenging" ? "text-[#E9E7E2]" : "text-[#E9E7E2]/60"
              }`}
              onClick={() => setActivePerspective("challenging")}
            >
              <span
                className={`relative ${
                  activePerspective === "challenging" &&
                  "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
                }`}
              >
                Challenging Voices
              </span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {activePerspective === "kindred" && (
              <div className="space-y-4">
                {kindredSpirit1 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png"
                            alt="Friedrich Nietzsche"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {kindredSpirit1 || "FRIEDRICH NIETZSCHE"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Kindred Spirit 1</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {kindredSpirit2 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png"
                            alt="Friedrich Nietzsche"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {kindredSpirit2 || "FRIEDRICH NIETZSCHE"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Kindred Spirit 2</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {kindredSpirit3 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png"
                            alt="Friedrich Nietzsche"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {kindredSpirit3 || "FRIEDRICH NIETZSCHE"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Kindred Spirit 3</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {kindredSpirit4 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png"
                            alt="Friedrich Nietzsche"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {kindredSpirit4 || "FRIEDRICH NIETZSCHE"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Kindred Spirit 4</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {kindredSpirit5 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Friedrich%20Nietzsche.png"
                            alt="Friedrich Nietzsche"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {kindredSpirit5 || "FRIEDRICH NIETZSCHE"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Kindred Spirit 5</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activePerspective === "challenging" && (
              <div className="space-y-4">
                {challengingVoice1 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png"
                            alt="Martin Heidegger"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {challengingVoice1 || "MARTIN HEIDEGGER"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Challenging Voice 1</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {challengingVoice2 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png"
                            alt="Martin Heidegger"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {challengingVoice2 || "MARTIN HEIDEGGER"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Challenging Voice 2</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {challengingVoice3 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png"
                            alt="Martin Heidegger"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {challengingVoice3 || "MARTIN HEIDEGGER"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Challenging Voice 3</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {challengingVoice4 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png"
                            alt="Martin Heidegger"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {challengingVoice4 || "MARTIN HEIDEGGER"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Challenging Voice 4</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
                {challengingVoice5 && (
                  <div className="rounded-xl p-4 bg-[#383741]/80 shadow-inner flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative mr-4">
                        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={0.75} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Martin%20Heidegger.png"
                            alt="Martin Heidegger"
                            className="h-10 w-10 object-cover"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">
                          {challengingVoice5 || "MARTIN HEIDEGGER"}
                        </h3>
                        <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Challenging Voice 5</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DomainDetail;
