import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import DNADomainContent from "@/components/bookshelf/dna/DNADomainContent";
import BackButton from "@/components/navigation/BackButton";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { supabase } from "@/integrations/supabase/client";

// Type assertion to silence TypeScript errors
const supabaseAny = supabase as any;

const IntellectualDNAShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dnaAnalysisData, profileData, isLoading, debugInfo } = useProfileData();

  useEffect(() => {
    async function checkDNAMatches() {
      console.log("[SHELF DIAGNOSTICS] IntellectualDNAShelf component mounted");
      console.log("[SHELF DIAGNOSTICS] User:", user?.id || "Not logged in");
      console.log("[SHELF DIAGNOSTICS] Profile Data:", profileData || "Not available");
      console.log("[SHELF DIAGNOSTICS] DNA Analysis Data:", dnaAnalysisData || "Not available");
      console.log("[SHELF DIAGNOSTICS] Profile Context Debug Info:", debugInfo);
      
      // Only run this if we have a valid assessment ID
      if (dnaAnalysisData?.assessment_id) {
        try {
          // Check database for matches
          console.log(`[SHELF DIAGNOSTICS] Querying dna_analysis_results_matched for assessment ID: ${dnaAnalysisData.assessment_id}`);
          
          const { data: matchesData, error: matchesError } = await supabaseAny
            .from("dna_analysis_results_matched")
            .select("field_name, matched_id, matched_name, type")
            .eq("assessment_id", dnaAnalysisData.assessment_id);
            
          if (matchesError) {
            console.error("[SHELF DIAGNOSTICS] Error querying matches:", matchesError);
          } else {
            console.log(`[SHELF DIAGNOSTICS] Found ${matchesData?.length || 0} matches for assessment ID: ${dnaAnalysisData.assessment_id}`);
            
            // Group by domain for easier analysis
            const domainCounts: Record<string, number> = {};
            matchesData?.forEach(match => {
              const parts = match.field_name.split('_');
              if (parts.length > 0) {
                const domain = parts[0];
                domainCounts[domain] = (domainCounts[domain] || 0) + 1;
              }
            });
            
            console.log(`[SHELF DIAGNOSTICS] Matches by domain:`, domainCounts);
            console.log(`[SHELF DIAGNOSTICS] Sample matches:`, matchesData?.slice(0, 5) || []);
            
            // Check if there are any fields with "classic" in the field name
            const classicFields = matchesData?.filter(match => match.field_name.includes('_classic')) || [];
            console.log(`[SHELF DIAGNOSTICS] Fields with "_classic" suffix: ${classicFields.length}`);
            
            // Check profile connection to assessment
            const { data: profileCheck, error: profileError } = await supabaseAny
              .from("profiles")
              .select("id, assessment_id")
              .eq("user_id", user?.id)
              .maybeSingle();
              
            if (profileError) {
              console.error("[SHELF DIAGNOSTICS] Error checking profile:", profileError);
            } else {
              console.log(`[SHELF DIAGNOSTICS] Profile check:`, profileCheck);
              if (profileCheck?.assessment_id !== dnaAnalysisData.assessment_id) {
                console.warn(`[SHELF DIAGNOSTICS] MISMATCH: Profile.assessment_id (${profileCheck?.assessment_id}) does not match dnaAnalysisData.assessment_id (${dnaAnalysisData.assessment_id})`);
              }
            }
          }
        } catch (error) {
          console.error("[SHELF DIAGNOSTICS] Exception in diagnostics:", error);
        }
      }
    }
    
    checkDNAMatches();
  }, [user, dnaAnalysisData, profileData, debugInfo]);

  const handleBack = () => {
    navigate("/bookshelf");
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 px-4 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <BackButton />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          INTELLECTUAL DNA SHELF
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>
      
      {/* Main Content - using overflow-auto directly */}
      <div className="flex-1 overflow-auto pb-20 px-4 pt-6">
        {/* Ethics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              ETHICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on the good
            </p>
          </div>
          <DNADomainContent domain="ethics" />
        </div>
        
        {/* Epistemology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              EPISTEMOLOGY
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on knowledge
            </p>
          </div>
          <DNADomainContent domain="epistemology" />
        </div>
        
        {/* Politics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              POLITICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on power
            </p>
          </div>
          <DNADomainContent domain="politics" />
        </div>
        
        {/* Theology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              THEOLOGY
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on the divine
            </p>
          </div>
          <DNADomainContent domain="theology" />
        </div>
        
        {/* Ontology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              ONTOLOGY
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on reality
            </p>
          </div>
          <DNADomainContent domain="ontology" />
        </div>
        
        {/* Aesthetics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              AESTHETICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on beauty
            </p>
          </div>
          <DNADomainContent domain="aesthetics" />
        </div>
        
        {/* Added extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default IntellectualDNAShelf;
