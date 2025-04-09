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
  
  const handleInfoClick = () => {
    navigate('/exam/badge-info');
  };
  
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
      <button
        onClick={handleInfoClick}
        className="w-10 h-10 flex items-center justify-center focus:outline-none"
        aria-label="Badge Information"
      >
        <div className="relative">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E9E7E2"
            strokeWidth="1"
            className="hexagon-icon"
          >
            <path
              d="M21 16.05V7.95C20.9988 7.6834 20.9344 7.4209 20.811 7.18465C20.6875 6.94841 20.5088 6.74591 20.29 6.6L12.71 2.05C12.4903 1.90551 12.2376 1.82883 11.98 1.82883C11.7224 1.82883 11.4697 1.90551 11.25 2.05L3.67 6.6C3.45124 6.74591 3.27248 6.94841 3.14903 7.18465C3.02558 7.4209 2.96118 7.6834 2.96 7.95V16.05C2.96118 16.3166 3.02558 16.5791 3.14903 16.8153C3.27248 17.0516 3.45124 17.2541 3.67 17.4L11.25 21.95C11.4697 22.0945 11.7224 22.1712 11.98 22.1712C12.2376 22.1712 12.4903 22.0945 12.71 21.95L20.29 17.4C20.5088 17.2541 20.6875 17.0516 20.811 16.8153C20.9344 16.5791 20.9988 16.3166 21 16.05Z"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-libre-baskerville font-bold text-sm text-[#E9E7E2]">i</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ExamHeader;
