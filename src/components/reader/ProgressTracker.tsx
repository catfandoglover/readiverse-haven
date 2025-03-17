
import React from "react";
import { Hexagon } from "lucide-react";

interface ProgressTrackerProps {
  bookProgress: number;
  pageInfo: {
    current: number;
    total: number;
    chapterCurrent: number;
    chapterTotal: number;
  };
}

const ProgressTracker = ({ bookProgress, pageInfo }: ProgressTrackerProps) => {
  // Convert progress percentage to level (1-6)
  const currentLevel = Math.ceil(bookProgress / 16.67);
  
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
    <>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Book Progress</span>
          <span>{stageName} ({bookProgress}%)</span>
        </div>
        <div className="flex space-x-1">
          {levels.map(level => (
            <div key={level} className="relative w-7 h-8">
              <Hexagon 
                className={`w-7 h-8 ${level <= currentLevel ? 'text-[#9b87f5]' : 'text-[#9b87f5]/20'}`}
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
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <span>Chapter Page {pageInfo.chapterCurrent} of {pageInfo.chapterTotal}</span>
      </div>
    </>
  );
};

export default ProgressTracker;
