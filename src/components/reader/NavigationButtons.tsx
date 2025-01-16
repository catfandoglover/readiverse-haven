import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
  onPrevPage: () => void;
  onNextPage: () => void;
}

const NavigationButtons = ({ onPrevPage, onNextPage }: NavigationButtonsProps) => {
  return (
    <>
      <div className="fixed md:absolute left-1 md:-left-16 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onPrevPage}
          className="h-6 w-6 md:h-10 md:w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <ChevronLeft className="h-3 w-3 md:h-5 md:w-5" />
        </Button>
      </div>
      <div className="fixed md:absolute right-1 md:-right-16 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onNextPage}
          className="h-6 w-6 md:h-10 md:w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <ChevronRight className="h-3 w-3 md:h-5 md:w-5" />
        </Button>
      </div>
    </>
  );
};

export default NavigationButtons;