
import React from "react";
import { ArrowRight, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  
  // Convert progress percentage to level (1-6)
  const currentLevel = Math.ceil(progress / 16.67);
  
  // Map level number to stage name
  const stageName = {
    1: "SCRIBE",
    2: "MESSENGER",
    3: "ALCHEMIST",
    4: "CARTOGRAPHER", 
    5: "JUDGE",
    6: "CREATOR"
  }[currentLevel] || "SCRIBE";

  // Generate array of 6 levels
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
          
          <div className="flex space-x-1 mb-1">
            {levels.map(level => (
              <div key={level} className="relative w-7 h-8">
                <Hexagon 
                  className={`w-7 h-8 ${level <= currentLevel ? 'text-[#CCFF23]' : 'text-[#CCFF23]/20'}`}
                  strokeWidth={1}
                />
                <span 
                  className={`absolute inset-0 flex items-center justify-center text-xs font-bold
                    ${level <= currentLevel ? 'text-[#E9E7E2]' : 'text-[#E9E7E2]/40'}`}
                >
                  {level}
                </span>
              </div>
            ))}
          </div>
          
          <span className="text-xs text-[#E9E7E2]/60 block font-oxanium">
            {stageName}
          </span>
        </div>
        
        <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center ml-4">
          <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
        </button>
      </div>
    </div>
  );
};

export default DomainCard;
