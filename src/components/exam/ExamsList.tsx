
import React from "react";
import { useNavigate } from "react-router-dom";
import { Hexagon } from "lucide-react";

interface ExamItem {
  id: string;
  title: string;
  description: string;
  score: number;
  image: string;
}

const ExamsList: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data - in a real application, this would come from a database or API
  const exams: ExamItem[] = [
    {
      id: "exam1",
      title: "Ethics & Morality",
      description: "Test your knowledge of ethical frameworks",
      score: 3,
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "exam2",
      title: "Critical Thinking",
      description: "Evaluate your analytical skills",
      score: 5,
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "exam3",
      title: "Political Philosophy",
      description: "Test your understanding of political systems",
      score: 2,
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    }
  ];
  
  const handleSelectExam = (exam: ExamItem) => {
    navigate('/exam-virgil-chat', { 
      state: { 
        examData: exam
      }
    });
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
              <div className="relative">
                <Hexagon className="h-8 w-8 text-[#CCFF23]" strokeWidth={1.5} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#3D3D6F]">
                  {exam.score}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamsList;
