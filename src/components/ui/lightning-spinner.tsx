
import React from "react";
import { cn } from "@/lib/utils";

interface LightningSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LightningSpinner: React.FC<LightningSpinnerProps> = ({ 
  className,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-6",
    md: "w-6 h-8",
    lg: "w-8 h-12"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        className={cn(
          "animate-pulse text-[#CCFF23]", 
          sizeClasses[size]
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <div className={cn(
        "absolute inset-0 bg-[#CCFF23]/30 blur-md animate-pulse rounded-full",
        sizeClasses[size]
      )}></div>
    </div>
  );
};
