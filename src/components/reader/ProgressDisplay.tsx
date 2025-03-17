
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressDisplayProps {
  progress: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const ProgressDisplay = ({ 
  progress, 
  showLabel = true, 
  label = "Progress", 
  className = "" 
}: ProgressDisplayProps) => {
  const displayProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#E9E7E2]/60 font-oxanium">
          <span>{label}</span>
          <span>{Math.round(displayProgress)}%</span>
        </div>
      )}
      <Progress value={displayProgress} className="h-1.5" />
    </div>
  );
};

export { ProgressDisplay };
