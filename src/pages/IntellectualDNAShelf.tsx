import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/navigation/BackButton";
import IntellectualDNAShelfContent from "@/components/bookshelf/dna/IntellectualDNAShelf";
import { Dna } from "lucide-react";

const IntellectualDNAShelfPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStudyClick = () => {
    navigate("/bookshelf");
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 px-4 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <BackButton />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto flex items-center gap-2">
          <Dna className="h-4 w-4" />
          INTELLECTUAL DNA BOOKS
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>
      
      {/* Main Content - using overflow-auto directly */}
      <div className="flex-1 overflow-auto pb-20">
        <IntellectualDNAShelfContent />
        
        {/* Added extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default IntellectualDNAShelfPage;
