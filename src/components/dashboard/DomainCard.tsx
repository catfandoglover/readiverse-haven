
import React from "react";
import { ArrowRight, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "../ui/progress";

export interface DomainCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  color: string;
}

const DomainCard: React.FC<DomainCardProps> = ({
  id,
  title,
  description,
  icon,
  progress,
  color,
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="rounded-xl overflow-hidden bg-[#383741] mb-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/dashboard/domain/${id}`)}
    >
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="relative h-10 w-10 flex items-center justify-center mr-3">
            <Hexagon className="absolute h-10 w-10 text-[#CCFF23]" strokeWidth={1.5} />
            <div className="relative z-10 text-[#E9E7E2]">{icon}</div>
          </div>
          <h3 className="text-lg font-oxanium font-bold uppercase">{title}</h3>
        </div>
        
        <p className="text-sm text-[#E9E7E2]/70 mb-3 font-baskerville">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Progress value={progress} className="h-1.5" />
            <span className="text-xs text-[#E9E7E2]/60 mt-1 block">
              {progress}% Explored
            </span>
          </div>
          
          <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainCard;
