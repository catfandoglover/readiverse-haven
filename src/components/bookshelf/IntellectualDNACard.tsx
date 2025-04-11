import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dna, ArrowUpRight } from "lucide-react";
import { useProfileData } from "@/contexts/ProfileDataContext";

const IntellectualDNACard: React.FC = () => {
  const navigate = useNavigate();
  const { dnaAnalysisData, isLoading } = useProfileData();
  
  const handleClick = () => {
    navigate("/intellectual-dna-shelf");
  };
  
  // Check if user has completed DNA assessment
  const hasCompletedAssessment = !!dnaAnalysisData?.assessment_id;
  
  return (
    <Card 
      className="overflow-hidden mb-6 bg-gradient-to-r from-[#3D3D6F] to-[#332E38] text-[#E9E7E2] border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#4D4D8F]/30 p-2 rounded-full mr-3">
              <Dna className="h-5 w-5 text-[#CCFF23]" />
            </div>
            <div>
              <h3 className="font-oxanium uppercase text-[#E9E7E2] font-semibold tracking-wide text-sm">
                Intellectual DNA Books
              </h3>
              <p className="text-xs text-[#E9E7E2]/60 font-oxanium">
                {hasCompletedAssessment
                  ? "Books matched to your philosophical profile"
                  : "Complete the assessment to unlock your reading list"}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#CCFF23]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default IntellectualDNACard;
