
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationButtonsProps {
  onPrevPage: () => void;
  onNextPage: () => void;
}

const NavigationButtons = ({ onPrevPage, onNextPage }: NavigationButtonsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <div className="fixed md:absolute left-3 md:-left-16 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onPrevPage}
          className="h-8 w-8 md:h-10 md:w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
      <div className="fixed md:absolute right-3 md:-right-16 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onNextPage}
          className="h-8 w-8 md:h-10 md:w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </>
  );
};

export default NavigationButtons;
