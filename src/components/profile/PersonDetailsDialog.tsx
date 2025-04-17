import React, { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileData } from "@/contexts/ProfileDataContext";
import { useSwipeable } from "react-swipeable";

// Create a custom dialog content that doesn't include the default close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-0 border-0 p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl md:w-full overflow-hidden",
        "bg-[#383741] text-[#E9E7E2] border-[#4E4955] max-w-md mx-auto rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = "CustomDialogContent";

interface PersonDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  classic?: string;
  rationale?: string;
  imageUrl?: string;
  // Add new props for navigation
  allPeople?: Array<{
    name: string;
    classic: string;
    rationale: string;
    domain: string;
    type: "KINDRED SPIRIT" | "CHALLENGING VOICE";
    imageUrl: string;
    iconUrl?: string;
    isMost?: boolean;
    useIconFallback?: boolean;
  }>;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

const PersonDetailsDialog: React.FC<PersonDetailsDialogProps> = ({
  isOpen,
  onClose,
  name,
  classic,
  rationale,
  imageUrl,
  allPeople = [],
  currentIndex = 0,
  onNavigate = () => {},
}) => {
  const { getIconByName } = useProfileData();
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  
  // Format title as "Name, Classic (Year)" if classic has year in parentheses
  const formatTitle = () => {
    if (!classic) return name;
    
    const yearMatch = classic.match(/\((\d{4})\)/);
    if (yearMatch) {
      return `${name}, ${classic}`;
    }
    
    return `${name}, ${classic}`;
  };

  // Get thinker illustration from icons table instead of using the provided imageUrl
  const fallbackImageUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8";
  
  // Use the thinker illustration from the getIconByName function
  const thinkerIllustration = getIconByName(name) || fallbackImageUrl;

  // Get the current person details
  const currentPerson = allPeople[currentIndex] || {
    type: "KINDRED SPIRIT" as const,
    isMost: false,
    domain: ""
  };
  const currentPersonType = currentPerson.type;
  const isMost = currentPerson.isMost || false;
  const currentDomain = currentPerson.domain;
  
  // Determine background color based on type
  const typeBgColorClass = currentPersonType === "KINDRED SPIRIT" 
    ? "bg-[#1D3A35]/90" 
    : "bg-[#301630]/90";
    
  // Get proper display text for the type indicator
  const getTypeDisplayText = () => {
    if (isMost) {
      return `MOST ${currentPersonType}`;
    } else {
      // For regular entries, uppercase the domain
      return currentDomain.toUpperCase();
    }
  };

  // Navigation functions
  const hasPrevious = allPeople.length > 0 && currentIndex > 0;
  const hasNext = allPeople.length > 0 && currentIndex < allPeople.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      setTransitionDirection('left');
      setTimeout(() => {
        onNavigate(currentIndex - 1);
      }, 150);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setTransitionDirection('right');
      setTimeout(() => {
        onNavigate(currentIndex + 1);
      }, 150);
    }
  };

  // Reset transition direction after animation completes
  useEffect(() => {
    if (transitionDirection) {
      const timer = setTimeout(() => {
        setTransitionDirection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [transitionDirection]);

  // Set up swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => hasNext && goToNext(),
    onSwipedRight: () => hasPrevious && goToPrevious(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // Compute transition classes for slide animations
  const getTransitionClasses = () => {
    if (!transitionDirection) return "";
    return transitionDirection === 'right'
      ? "animate-slide-out-left" 
      : "animate-slide-out-right";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="relative">
        {/* Outside navigation arrows - desktop only */}
        {hasPrevious && (
          <button 
            onClick={goToPrevious}
            className="hidden md:flex absolute left-[-60px] top-1/2 -translate-y-1/2 z-50 rounded-full h-10 w-10 items-center justify-center bg-[#383741]/80 backdrop-blur-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <ChevronLeft className="h-6 w-6 text-[#E9E7E2]" />
            <span className="sr-only">Previous</span>
          </button>
        )}
        
        {hasNext && (
          <button 
            onClick={goToNext}
            className="hidden md:flex absolute right-[-60px] top-1/2 -translate-y-1/2 z-50 rounded-full h-10 w-10 items-center justify-center bg-[#383741]/80 backdrop-blur-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <ChevronRight className="h-6 w-6 text-[#E9E7E2]" />
            <span className="sr-only">Next</span>
          </button>
        )}
        
        <CustomDialogContent className="rounded-2xl overflow-hidden">
          <div 
            {...swipeHandlers} 
            className={`w-full transition-transform duration-300 ${getTransitionClasses()}`}
          >
            {/* Image section at the top with constrained aspect ratio */}
            <div className="relative w-full aspect-square overflow-hidden">
              <img 
                src={thinkerIllustration} 
                alt={name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = fallbackImageUrl;
                }}
              />
              
              {/* Type indicator pills */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {/* Domain or MOST indicator */}
                <div className={`rounded-2xl px-3 py-1 backdrop-blur-sm bg-[#383741]/80 flex justify-center items-center`}>
                  <span className="font-oxanium uppercase italic text-[10px] tracking-tight text-white whitespace-nowrap text-center">
                    {getTypeDisplayText()}
                  </span>
                </div>
                
                {/* Type indicator for non-MOST entries */}
                {!isMost && (
                  <div className={`rounded-2xl px-3 py-1 backdrop-blur-sm ${typeBgColorClass} flex justify-center items-center`}>
                    <span className="font-oxanium italic uppercase text-[10px] tracking-tight text-white whitespace-nowrap text-center">
                      {currentPersonType}
                    </span>
                  </div>
                )}
              </div>

              <DialogClose className="absolute right-3 top-3 rounded-full h-8 w-8 flex items-center justify-center bg-[#383741]/80 backdrop-blur-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none z-10">
                <X className="h-4 w-4 text-[#E9E7E2]/80" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>

            {/* Content section */}
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-oxanium text-[#E9E7E2] font-bold">
                  {formatTitle()}
                </DialogTitle>
                {rationale && (
                  <DialogDescription className="text-sm font-oxanium text-[#E9E7E2]/80 mt-3">
                    {rationale}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <DialogFooter className="mt-6">
                <Button 
                  className="w-full h-[48px] rounded-xl bg-[#e9e7e2] text-[#332e38] hover:bg-[#e9e7e2]/90 font-oxanium uppercase text-sm font-bold"
                  onClick={() => {
                    // Future functionality will be implemented here
                    onClose();
                  }}
                >
                  START A CONVERSATION
                </Button>
              </DialogFooter>
            </div>
          </div>
        </CustomDialogContent>
      </div>
    </Dialog>
  );
};

export default PersonDetailsDialog; 