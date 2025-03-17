
import React from "react";
import { Hexagon } from "lucide-react";

interface ProgressDisplayProps {
  progress: number;
  compact?: boolean;
  showText?: boolean;
}

const ProgressDisplay = ({ progress, compact = false, showText = true }: ProgressDisplayProps) => {
  // Convert progress percentage to level (1-6)
  const currentLevel = getProgressLevel(progress);
  
  // Map level number to stage name
  const stageName = getStageName(currentLevel);
  
  // Generate array of 6 levels
  const levels = [1, 2, 3, 4, 5, 6];
  
  return (
    <div>
      <div className="flex space-x-1">
        {levels.map(level => (
          <div key={level} className={`relative ${compact ? 'w-5 h-6' : 'w-7 h-8'} pb-2`}>
            <Hexagon 
              className={`${compact ? 'w-5 h-6' : 'w-7 h-8'} ${level <= currentLevel ? 'text-[#CCFF23]' : 'text-[#CCFF23]/20'}`}
              strokeWidth={compact ? 1.5 : 1}
            />
            <span 
              className={`absolute inset-0 flex items-center justify-center ${compact ? 'text-[0.6rem]' : 'text-xs'} font-bold
                ${level <= currentLevel ? 'text-[#E9E7E2]' : 'text-[#E9E7E2]/40'}`}
            >
              {level}
            </span>
          </div>
        ))}
      </div>
      {showText && (
        <span className="text-xs text-[#E9E7E2]/60 block font-oxanium mt-1">
          {stageName} ({progress}%)
        </span>
      )}
    </div>
  );
};

// Helper functions
const getProgressLevel = (progress: number): number => {
  if (progress <= 16.67) return 1;
  if (progress <= 33.33) return 2;
  if (progress <= 50) return 3;
  if (progress <= 66.67) return 4;
  if (progress <= 83.33) return 5;
  return 6;
};

const getStageName = (level: number): string => {
  const stageNames = {
    1: "SCRIBE",
    2: "MESSENGER",
    3: "ALCHEMIST", 
    4: "CARTOGRAPHER",
    5: "JUDGE",
    6: "CREATOR"
  };
  return stageNames[level as keyof typeof stageNames] || "SCRIBE";
};

export { ProgressDisplay, getProgressLevel, getStageName };
