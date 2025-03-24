
import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WelcomeContainerProps {
  onDismiss: () => void;
}

const WelcomeContainer: React.FC<WelcomeContainerProps> = ({ onDismiss }) => {
  const isMobile = useIsMobile();
  
  // Get the subtitle color based on aesthetics (matches the card subtitle colors)
  const subtitleColor = "text-[#E9E7E2]/70";
  
  return (
    <div className={cn(
      "bg-[#4A4351]/50 rounded-xl relative mb-8",
      isMobile ? "p-5" : "p-8"
    )}>
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 text-[#E9E7E2]/70 hover:text-[#E9E7E2] transition-colors"
        aria-label="Dismiss welcome message"
      >
        <X size={isMobile ? 18 : 24} />
      </button>
      
      <h1 className={cn(
        "font-baskerville text-[#E9E7E2] font-bold mb-3",
        isMobile ? "text-xl" : "text-2xl"
      )}>
        Discover, awaken, and direct a love of learning.
      </h1>
      
      <h2 className={cn(
        subtitleColor, "font-normal leading-relaxed",
        isMobile ? "text-sm" : "text-base"
      )}>
        Choose your own emotional, intellectual, or practical path to become who you are.
      </h2>
    </div>
  );
};

export default WelcomeContainer;
