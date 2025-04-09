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
import { useToast } from "@/hooks/use-toast";
import { getHexagonColor, getStageName } from "@/components/reader/MasteryScore";

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

// Helper function to get roman numeral
const getRomanNumeral = (level: number): string => {
  switch(level) {
    case 1: return "I";
    case 2: return "II";
    case 3: return "III";
    case 4: return "IV";
    case 5: return "V";
    case 6: return "VI";
    default: return "I";
  }
};

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
            <div className="relative mb-1" style={{ height: '60px', width: '60px' }}>
              <svg 
                viewBox="0 0 24 24" 
                height="100%" 
                width="100%" 
                xmlns="http://www.w3.org/2000/svg" 
                fill={getHexagonColor(resource.score || 1)}
                stroke="#E9E7E2"
                strokeWidth="0.5"
              >
                <path d="M21 16.05V7.95C20.9988 7.6834 20.9344 7.4209 20.811 7.18465C20.6875 6.94841 20.5088 6.74591 20.29 6.6L12.71 2.05C12.4903 1.90551 12.2376 1.82883 11.98 1.82883C11.7224 1.82883 11.4697 1.90551 11.25 2.05L3.67 6.6C3.45124 6.74591 3.27248 6.94841 3.14903 7.18465C3.02558 7.4209 2.96118 7.6834 2.96 7.95V16.05C2.96118 16.3166 3.02558 16.5791 3.14903 16.8153C3.27248 17.0516 3.45124 17.2541 3.67 17.4L11.25 21.95C11.4697 22.0945 11.7224 22.1712 11.98 22.1712C12.2376 22.1712 12.4903 22.0945 12.71 21.95L20.29 17.4C20.5088 17.2541 20.6875 17.0516 20.811 16.8153C20.9344 16.5791 20.9988 16.3166 21 16.05Z"></path>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-libre-baskerville font-bold text-lg" style={{ color: (resource.score || 1) === 6 ? "#FFFFFF" : "#3D3D6F" }}>
                {getRomanNumeral(resource.score || 1)}
              </span>
            </div>
            
            <p className="text-xs font-oxanium text-center uppercase font-bold mb-4" style={{ color: getHexagonColor(resource.score || 1) }}>
              {getStageName(resource.score || 1)}
            </p>
            <AlertDialogTitle className="text-center mt-4">{resource.title}</AlertDialogTitle>
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
