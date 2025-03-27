
import React from "react";
import { useNavigate } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { getProgressLevel, getStageName } from "../reader/MasteryScore";

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
    // For exams with badges (that have a score and domainId), go directly to share badge page
    if (exam.score && exam.domainId) {
      navigate(`/share-badge/${exam.domainId}/${exam.id}`, { 
        state: { 
          resource: {
            id: exam.id,
            title: exam.title,
            subtitle: exam.description,
            score: exam.score,
            domainId: exam.domainId,
            image: exam.image
          }
        }
      });
    } else {
      // For exams without badges, continue to exam-virgil-chat
      navigate('/exam-virgil-chat', { 
        state: { 
          examData: exam
        }
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold">
          MY BADGES
        </h2>
      </div>
      
      <div className="space-y-3">
        {exams.map((exam) => (
          <div 
            key={exam.id}
            className="rounded-2xl p-4 pb-1.5 shadow-inner cursor-pointer hover:bg-[#373763]/70 transition-colors"
            style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(55, 55, 99, 0.1))' }}
            onClick={() => handleSelectExam(exam)}
          >
            <div className="flex items-center mb-3">
              <div className="flex items-center flex-1">
                <div className="relative mr-4">
                  <Hexagon className="h-10 w-10 text-[#3D3D6F]" strokeWidth={3} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={exam.image} 
                      alt={exam.title}
                      className="h-9 w-9 object-cover rounded-2xl"
                      style={{ 
                        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                      }}
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
                  {/* Hexagon with solid fill */}
                  <div 
                    style={{ 
                      height: '2rem', 
                      width: '2rem', 
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
    </div>
  );
};

export default ExamsList;
