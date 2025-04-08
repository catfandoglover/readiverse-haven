import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface ExamHeaderProps {
  className?: string;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ 
  className = ""
}) => {
  const navigate = useNavigate();
  
  return (
    <div className={`flex items-center pt-4 px-4 bg-[#3D3D6F] text-[#E9E7E2] ${className}`}>
      <button
        onClick={() => navigate('/virgil')}
        className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
        aria-label="Back to Virgil's Office"
      >
        <ArrowLeft className="h-7 w-7" />
      </button>
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
