
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hexagon } from "lucide-react";

const LastExamHero: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data - in a real application, this would come from a database or API
  const lastExam = {
    id: "exam1",
    title: "Philosophy Foundations",
    description: "Test your knowledge on the foundations of philosophy",
    score: 4,
    image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
  };
  
  const handleContinueExam = () => {
    navigate('/exam-virgil-chat', { 
      state: { 
        examData: lastExam
      }
    });
  };
  
  return (
    <div className="bg-[#373763] p-4 rounded-b-2xl shadow-md">
      <div className="flex flex-col md:flex-row items-center mb-4">
        <div className="relative w-16 h-16 md:mr-4">
          <Hexagon className="h-16 w-16 text-[#E9E7E2]/10" strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={lastExam.image} 
              alt={lastExam.title}
              className="h-14 w-14 object-cover"
              style={{ 
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              }}
            />
          </div>
        </div>
        
        <div className="flex-1 mt-3 md:mt-0 text-center md:text-left">
          <h3 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-xs font-bold">
            CONTINUE YOUR LAST EXAM
          </h3>
          <h2 className="text-xl font-baskerville text-[#E9E7E2] mb-1">{lastExam.title}</h2>
          
          <div className="flex items-center justify-center md:justify-start">
            <div className="relative mr-2">
              <Hexagon className="h-5 w-5 text-[#CCFF23]" strokeWidth={1.5} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#3D3D6F]">
                {lastExam.score}
              </span>
            </div>
            <span className="text-xs text-[#E9E7E2]/70">Current Score</span>
          </div>
        </div>
        
        <Button
          onClick={handleContinueExam}
          className="mt-4 md:mt-0 w-full md:w-auto py-3 px-6 h-[52px] rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] border border-[#E9E7E2]/20"
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};

export default LastExamHero;
