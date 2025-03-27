
import React from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="px-4 mb-6">
      <div 
        className="relative h-44 w-full rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleContinueExam}
      >
        {/* Background Image with Blur and Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${lastExam.image})` }}
        />
        <div className="absolute inset-0 bg-black/45" />
        
        {/* "RESUME" Button Text Overlay - Top Left */}
        <div className="absolute top-6 left-6">
          <p className="font-oxanium uppercase text-[#E9E7E2]/50 text-xs font-bold tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
            RESUME
          </p>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Text Content - Bottom Left */}
          <div className="flex flex-col">
            <h2 className="text-[#E9E7E2] font-baskerville font-bold text-lg line-clamp-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
              {lastExam.title}
            </h2>
            <p className="text-[#E9E7E2]/80 font-baskerville text-lg mt-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
              {lastExam.description}
            </p>
          </div>
        </div>
        
        {/* Score display - Bottom Right */}
        <div className="absolute bottom-6 right-6">
          <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
            <span className="text-[#CCFF23] font-oxanium font-bold text-sm mr-1">{lastExam.score}</span>
            <span className="text-[#E9E7E2]/70 text-xs font-oxanium">Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastExamHero;
