
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingActionButtonProps {
  icon?: LucideIcon;
  iconImage?: string;
  onClick: () => void;
  tooltip: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  iconImage,
  onClick,
  tooltip
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex items-center justify-center w-10 h-10 rounded-full 
                      bg-background/40 border border-border/5
                      shadow-sm backdrop-blur-md 
                      transition-all duration-300 ease-in-out
                      ${isHovered ? 'bg-background/70 transform scale-105 shadow-md' : ''}`}
          >
            {Icon ? (
              <Icon className={`h-5 w-5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`} />
            ) : iconImage ? (
              <img 
                src={iconImage} 
                alt={tooltip} 
                className={`h-full w-full p-1 object-contain transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`} 
              />
            ) : null}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-background/90 backdrop-blur-md border-border/10 shadow-md">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingActionButton;
