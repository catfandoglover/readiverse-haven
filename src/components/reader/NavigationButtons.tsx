
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface NavigationButtonsProps {
  onPrevPage: () => void;
  onNextPage: () => void;
}

const NavigationButtons = ({ onPrevPage, onNextPage }: NavigationButtonsProps) => {
  const isMobile = useIsMobile();
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);
  
  return (
    <>
      <div className="fixed md:absolute left-3 md:-left-16 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onPrevPage}
          onMouseEnter={() => setHoveredLeft(true)}
          onMouseLeave={() => setHoveredLeft(false)}
          className={`h-8 w-8 md:h-10 md:w-10 rounded-full shadow-sm bg-background/40 backdrop-blur-sm border-0 
                     transition-all duration-300 ease-in-out ${hoveredLeft ? 'bg-background/70 transform scale-110' : ''}`}
          aria-label="Previous page"
        >
          <ChevronLeft className={`h-4 w-4 md:h-5 md:w-5 transition-opacity duration-300 ${hoveredLeft ? 'opacity-100' : 'opacity-70'}`} />
        </Button>
      </div>
      <div className="fixed md:absolute right-3 md:-right-16 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onNextPage}
          onMouseEnter={() => setHoveredRight(true)}
          onMouseLeave={() => setHoveredRight(false)}
          className={`h-8 w-8 md:h-10 md:w-10 rounded-full shadow-sm bg-background/40 backdrop-blur-sm border-0 
                     transition-all duration-300 ease-in-out ${hoveredRight ? 'bg-background/70 transform scale-110' : ''}`}
          aria-label="Next page"
        >
          <ChevronRight className={`h-4 w-4 md:h-5 md:w-5 transition-opacity duration-300 ${hoveredRight ? 'opacity-100' : 'opacity-70'}`} />
        </Button>
      </div>
    </>
  );
};

export default NavigationButtons;
