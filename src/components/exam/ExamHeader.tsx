import React from "react";
import MainMenu from "../navigation/MainMenu";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface ExamHeaderProps {
  className?: string;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ 
  className = ""
}) => {
  return (
    <div className={`flex items-center pt-4 px-4 bg-[#3D3D6F] text-[#E9E7E2] ${className}`}>
      <MainMenu />
      <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
        EXAM ROOM
      </h2>
      <div className="w-10 h-10">
        {/* Empty div to balance the layout */}
      </div>
    </div>
  );
};

export default ExamHeader;
