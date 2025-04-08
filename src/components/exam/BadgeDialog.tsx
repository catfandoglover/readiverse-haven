import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { getHexagonColor, getStageName } from "@/components/reader/MasteryScore";
import { useToast } from "@/hooks/use-toast";

interface ResourceItem {
  id: string;
  title: string;
  subtitle: string;
  score?: number;
  domainId: string;
  image: string;
  about?: string;
}

interface BadgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
}

const BadgeDialog: React.FC<BadgeDialogProps> = ({ isOpen, onClose, resource }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!resource) return null;
  
  const handleShareBadge = () => {
    onClose();
    navigate(`/share-badge/${resource.domainId}/${resource.id}`, {
      state: { resource }
    });
  };

  const handleReviewExam = () => {
    onClose();
    navigate("/exam-virgil-chat", {
      state: {
        examData: {
          id: resource.id,
          title: resource.title,
          description: `Review your ${resource.title} exam results`,
          score: resource.score
        }
      }
    });
  };

  const handleTakeAgain = () => {
    // Close the badge dialog first
    onClose();
    
    // Then open the confirmation dialog
    const confirmRetake = window.confirm(
      "Taking this exam again will overwrite your previous results. Are you sure you want to continue?"
    );
    
    if (confirmRetake) {
      navigate("/exam-virgil-chat", {
        state: {
          examData: {
            id: resource.id,
            title: resource.title,
            description: `Retaking the ${resource.title} exam`,
            isRetake: true
          }
        }
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#E9E7E2] text-[#282828]">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            <div className="relative mb-1">
              <Hexagon 
                className="h-16 w-16" 
                fill={getHexagonColor(resource.score || 1)}
                stroke="none"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#000000]">
                {resource.score || 1}
              </span>
            </div>
            
            <p className="text-base font-oxanium text-center uppercase font-bold">
              {getStageName(resource.score || 1)}
            </p>
            <AlertDialogTitle className="text-center mt-6">{resource.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-center mt-6">
            {resource.subtitle}
          </AlertDialogDescription>
          
          {resource.about && (
            <div className="text-center mt-6 text-sm text-[#282828]/80 max-h-[120px] overflow-y-auto">
              {resource.about}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col space-y-2 sm:space-y-0">
          <AlertDialogAction
            onClick={handleReviewExam}
            className="bg-[#E9E7E2]/50 text-[#373763] hover:bg-[#E9E7E2] hover:text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider w-full border border-[#373763]/20 rounded-2xl h-12"
          >
            Review Exam
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleTakeAgain}
            className="bg-[#E9E7E2]/50 text-[#373763] hover:bg-[#E9E7E2] hover:text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider w-full border border-[#373763]/20 rounded-2xl h-12"
          >
            Take Again
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleShareBadge}
            className="bg-[#373763] text-[#E9E7E2] w-full"
          >
            Share Badge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BadgeDialog;
