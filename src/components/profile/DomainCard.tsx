import React, { useState, useEffect } from "react";
import { ArrowRight, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MasteryScore, getProgressLevel, getStageName } from "@/components/reader/MasteryScore";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";

// Remove the hardcoded ID
// const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

interface DNAAnalysisResult {
  [key: string]: string | null;
}

export interface DomainCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  color: string;
}

const DomainCard: React.FC<DomainCardProps> = ({
  id,
  title,
  description,
  progress,
  color,
}) => {
  const navigate = useNavigate();
  const [domainAnalysis, setDomainAnalysis] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { profileData, dnaAnalysisData } = useProfileData();
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        
        // Use the DNA analysis data from context if available
        if (dnaAnalysisData) {
          setDomainAnalysis(dnaAnalysisData as DNAAnalysisResult);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch it using the assessment_id from the user's profile
        if (!profileData?.assessment_id) {
          console.error("No assessment ID found in profile data");
          setIsLoading(false);
          return;
        }
        
        // First try using assessment_id field
        let { data, error } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', profileData.assessment_id)
          .maybeSingle();
          
        // If that fails, try using id field (legacy approach)
        if (!data && !error) {
          const { data: legacyData, error: legacyError } = await supabase
            .from('dna_analysis_results')
            .select('*')
            .eq('id', profileData.assessment_id)
            .maybeSingle();
            
          if (legacyData && !legacyError) {
            data = legacyData;
          }
        }
        
        if (data) {
          setDomainAnalysis(data as DNAAnalysisResult);
        }
      } catch (e) {
        console.error("Error fetching domain analysis for card:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomainData();
  }, [profileData, dnaAnalysisData]);
  
  return (
    <div 
      className="rounded-xl overflow-hidden bg-[#383741] shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/dashboard/domain/${id}`)}
    >
      <div className="p-4 flex items-center">
        <div className="flex-1">
          <h3 className="text-lg font-oxanium font-bold uppercase mb-2">{title}</h3>
          
          <p className="text-sm text-[#E9E7E2]/70 mb-3 font-oxanium">
            {description}
          </p>
          
          {/* SCORING SYSTEM - COMMENTED OUT
          <MasteryScore progress={progress} />
          */}
        </div>
        
        <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center ml-4">
          <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
        </button>
      </div>
    </div>
  );
};

export default DomainCard;
