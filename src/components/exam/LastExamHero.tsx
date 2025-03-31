
import React from "react";
import { useNavigate } from "react-router-dom";

const LastExamHero: React.FC = () => {
  const navigate = useNavigate();
  
  // Updated exam data with new content
  const lastExam = {
    id: "exam1",
    title: "First Principles",
    description: "Stripping away assumptions to reach bedrock truth",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Concept_Images/First%20principles.png"
  };
  
  const handleContinueExam = () => {
    navigate('/exam-virgil-chat', { 
      state: { 
        examData: lastExam
      }
    });
  };

  return (
    <div className="h-full w-full">
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
        
        {/* "SUGGESTED" Button Text Overlay - Top Left */}
        <div className="absolute top-6 left-6">
          <p className="font-oxanium uppercase text-[#E9E7E2]/50 text-xs font-bold tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
            SUGGESTED
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
      </div>
    </div>
  );
};

export default LastExamHero;
