
import React from 'react';
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
  noHoverEffect?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  iconImage,
  onClick,
  tooltip,
  noHoverEffect = false
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`flex items-center justify-center w-10 h-10 rounded-full 
                      bg-background/40 border border-border/5
                      shadow-sm backdrop-blur-md 
                      ${!noHoverEffect ? 'transition-all duration-300 ease-in-out hover:bg-background/70 hover:transform hover:scale-105 hover:shadow-md' : ''}`}
            aria-label={tooltip}
          >
            {Icon ? (
              <Icon className="h-5 w-5" />
            ) : iconImage ? (
              <img 
                src={iconImage} 
                alt={tooltip} 
                className="h-full w-full p-1 object-contain" 
              />
            ) : null}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-background/90 backdrop-blur-md border-border/10 shadow-md">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingActionButton;
