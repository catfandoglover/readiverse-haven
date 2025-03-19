
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MasteryScore, getProgressLevel, getStageName } from "@/components/reader/MasteryScore";
import { useAuth } from "@/contexts/OutsetaAuthContext";

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
        
        // First, get the dna_assessment_results directly using the Outseta Account.Uid
        // Instead of looking for assessment_id in profiles
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
          console.log("User assessment ID:", data.id);
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
    const fetchDomainData = async () => {
      if (!assessmentId) return;
      
      try {
        setIsLoading(true);
        const client = authSupabase || supabase;
        const { data, error } = await client
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', assessmentId)
          .maybeSingle();
          
        if (data && !error) {
          setDomainAnalysis(data as DNAAnalysisResult);
        }
      } catch (e) {
        console.error("Error fetching domain analysis for card:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (assessmentId) {
      fetchDomainData();
    }
  }, [assessmentId, authSupabase]);
  
  // Calculate the highest progress level across both kindred and challenging resources
  const getHighestProgressLevel = (): number => {
    if (isLoading || !domainAnalysis) {
      // Fall back to the passed progress prop if data isn't loaded yet
      return Math.ceil(progress / 16.67);
    }
    
    // These are the progress values for each resource - they determine the level
    const dummyProgressValues = [85, 65, 45, 25, 15];
    
    // Collect all progress values from both kindred and challenging resources
    let allProgressValues: number[] = [];
    
    // Collect progress values from kindred spirits
    for (let i = 1; i <= 5; i++) {
      if (domainAnalysis[`${id}_kindred_spirit_${i}`]) {
        allProgressValues.push(dummyProgressValues[i-1]);
      }
    }
    
    // Collect progress values from challenging voices
    for (let i = 1; i <= 5; i++) {
      if (domainAnalysis[`${id}_challenging_voice_${i}`]) {
        allProgressValues.push(dummyProgressValues[i-1]);
      }
    }
    
    // If we have no progress values, fall back to the passed progress prop
    if (allProgressValues.length === 0) {
      return Math.ceil(progress / 16.67);
    }
    
    // Find the highest progress value and convert to level
    const highestProgress = Math.max(...allProgressValues);
    return getProgressLevel(highestProgress);
  };
  
  // Get the highest level and the corresponding stage name
  const currentLevel = getHighestProgressLevel();
  const stageName = getStageName(currentLevel);
  
  // Generate array of 6 levels for display
  const levels = [1, 2, 3, 4, 5, 6];

  return (
    <div 
      className="rounded-xl overflow-hidden bg-[#383741] mb-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/dashboard/domain/${id}`)}
    >
      <div className="p-4 flex items-center">
        <div className="flex-1">
          <h3 className="text-lg font-oxanium font-bold uppercase mb-2">{title}</h3>
          
          <p className="text-sm text-[#E9E7E2]/70 mb-3 font-oxanium">
            {description}
          </p>
          
          <MasteryScore progress={progress} />
        </div>
        
        <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center ml-4">
          <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
        </button>
      </div>
    </div>
  );
};

export default DomainCard;
