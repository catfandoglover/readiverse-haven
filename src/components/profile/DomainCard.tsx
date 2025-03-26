import React, { useState, useEffect } from "react";
import { ArrowRight, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MasteryScore, getProgressLevel, getStageName } from "@/components/reader/MasteryScore";

// Fixed assessment ID - same as used in DomainDetail.tsx
const FIXED_ASSESSMENT_ID = 'b0f50af6-589b-4dcd-bd63-3a18f1e5da20';

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
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
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
    
    fetchDomainData();
  }, []);
  
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
