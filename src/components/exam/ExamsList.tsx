import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProgressLevel, getStageName } from "../reader/MasteryScore";
import BadgeDialog from "./BadgeDialog";

interface ExamItem {
  id: string;
  title: string;
  description: string;
  score: number;
  image: string;
  subtitle?: string;
  domainId?: string; // Added domainId property
}

// Helper function to get hex color based on score level
const getHexagonColor = (level: number): string => {
  switch(level) {
    case 1: return "#F9F9F9"; // Scribe
    case 2: return "#FFE0CA"; // Messenger
    case 3: return "#EFFE91"; // Alchemist
    case 4: return "#B8C8FF"; // Cartographer
    case 5: return "#D5B8FF"; // Judge
    case 6: return "#000000"; // Creator
    default: return "#F9F9F9";
  }
};

const ExamsList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Updated exam data with domain IDs
  const exams: ExamItem[] = [
    {
      id: "maimonides",
      title: "Maimonides",
      description: "Solid grasp, room for creative depth",
      score: 3,
      image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Maimonides.png",
      domainId: "theology" // Added domain ID
    },
    {
      id: "art-of-war",
      title: "The Art of War",
      description: "Masterfully evaluates strategic principles across contexts",
      score: 5,
      image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Sun%20Tzu.png",
      domainId: "politics" // Added domain ID
    },
    {
      id: "teleological-judgment",
      title: "Teleological judgment",
      description: "Recalls teleological concepts but without personal insight",
      score: 2,
      image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Concept_Images/Teleological%20judgment.png",
      domainId: "ethics" // Added domain ID
    }
  ];
  
  const handleSelectExam = (exam: ExamItem) => {
    // For exams with badges (that have a score and domainId), open the badge dialog
    if (exam.score && exam.domainId) {
      setSelectedExam(exam);
      setIsDialogOpen(true);
    } else {
      // For exams without badges, continue to exam-virgil-chat
      navigate('/exam-virgil-chat', { 
        state: { 
          examData: exam
        }
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedExam(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="h-px w-full my-6 bg-[#9F9EA1]/20"></div>
        <h2 className="font-oxanium text-base font-bold text-[#E9E7E2] px-1 uppercase tracking-wider">
          My Badges
        </h2>
      </div>
      
      <div className="space-y-3">
        {exams.map((exam) => (
          <div 
            key={exam.id}
            className="rounded-2xl p-4 pb-1.5 bg-[#373763]/80 shadow-inner cursor-pointer hover:bg-[#373763] transition-colors"
            onClick={() => handleSelectExam(exam)}
          >
            <div className="flex items-center mb-3">
              <div className="flex items-center flex-1">
                <div className="relative mr-4">
                  <div className="h-9 w-9 rounded-full overflow-hidden">
                    <img 
                      src={exam.image} 
                      alt={exam.title}
                      className="h-9 w-9 object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{exam.title}</h3>
                  <p className="text-xs text-[#E9E7E2]/70 font-oxanium">
                    {exam.description}
                  </p>
                </div>
              </div>
              <div className="relative flex flex-col items-center min-w-[80px]">
                <div className="relative flex flex-col items-center justify-center">
                  {/* Score badge */}
                  <div 
                    style={{ 
                      height: '2.25rem', 
                      width: '2.25rem', 
                      position: 'relative' 
                    }}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      height="100%" 
                      width="100%" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill={getHexagonColor(exam.score)}
                      stroke="none" 
                      strokeWidth="0" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="m21 16.2-9 5.1-9-5.1V7.8l9-5.1 9 5.1v8.4Z"></path>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#000000]">
                      {exam.score}
                    </span>
                  </div>
                  <span className="text-xs font-oxanium mt-1 whitespace-nowrap" style={{ color: getHexagonColor(exam.score) }}>
                    {getStageName(exam.score)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badge Dialog for exam options */}
      {selectedExam && (
        <BadgeDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          resource={{
            id: selectedExam.id,
            title: selectedExam.title,
            subtitle: selectedExam.description,
            score: selectedExam.score,
            domainId: selectedExam.domainId || "",
            image: selectedExam.image
          }}
        />
      )}
    </div>
  );
};

export default ExamsList;
