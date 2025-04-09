import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProgressLevel, getStageName } from "../reader/MasteryScore";
import BadgeDialog from "./BadgeDialog";
import { Share } from "lucide-react";

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
            className="rounded-2xl py-4 pr-4 pl-0 bg-[#373763]/80 shadow-inner cursor-pointer hover:bg-[#373763] transition-colors"
            onClick={() => handleSelectExam(exam)}
          >
            <div className="flex items-center">
              {/* Left side: Badge icon with level name - fixed width container */}
              <div className="flex flex-col items-center w-[70px]">
                <div 
                  style={{ 
                    height: '40px', 
                    width: '40px', 
                    position: 'relative' 
                  }}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    height="100%" 
                    width="100%" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill={getHexagonColor(exam.score)}
                    stroke="#E9E7E2"
                    strokeWidth="0.5"
                  >
                    <path d="M21 16.05V7.95C20.9988 7.6834 20.9344 7.4209 20.811 7.18465C20.6875 6.94841 20.5088 6.74591 20.29 6.6L12.71 2.05C12.4903 1.90551 12.2376 1.82883 11.98 1.82883C11.7224 1.82883 11.4697 1.90551 11.25 2.05L3.67 6.6C3.45124 6.74591 3.27248 6.94841 3.14903 7.18465C3.02558 7.4209 2.96118 7.6834 2.96 7.95V16.05C2.96118 16.3166 3.02558 16.5791 3.14903 16.8153C3.27248 17.0516 3.45124 17.2541 3.67 17.4L11.25 21.95C11.4697 22.0945 11.7224 22.1712 11.98 22.1712C12.2376 22.1712 12.4903 22.0945 12.71 21.95L20.29 17.4C20.5088 17.2541 20.6875 17.0516 20.811 16.8153C20.9344 16.5791 20.9988 16.3166 21 16.05Z"></path>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-libre-baskerville font-bold text-sm" style={{ color: exam.score === 6 ? "#FFFFFF" : "#3D3D6F" }}>
                    {getRomanNumeral(exam.score)}
                  </span>
                </div>
                <span className="text-[6px] font-oxanium mt-1 text-center" style={{ color: getHexagonColor(exam.score) }}>
                  {getStageName(exam.score)}
                </span>
              </div>
              
              {/* Middle: Title and description - flex grow to take available space */}
              <div className="flex-1">
                <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{exam.title}</h3>
                <p className="text-xs text-[#E9E7E2]/70 font-oxanium mt-1">
                  {exam.description}
                </p>
              </div>
              
              {/* Right side: Share icon - fixed width for consistency */}
              <div className="w-10 flex justify-center">
                <Share className="h-5 w-5 text-[#E9E7E2]/70" />
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
