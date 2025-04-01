
import React from "react";
import { useNavigate } from "react-router-dom";

const SuggestedExamHero: React.FC = () => {
  const navigate = useNavigate();
  
  // Using placeholder exam data
  const suggestedExam = {
    id: "exam2",
    title: "Philosophical Frameworks",
    description: "Explore competing systems of thought",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Concept_Images/First%20principles.png"
  };
  
  const handleStartExam = () => {
    console.log('SuggestedExamHero - Start exam clicked');
  };

  return (
    <div className="relative h-44 w-full rounded-2xl overflow-hidden cursor-pointer"
      onClick={handleStartExam}
    >
      {/* Background Image with Blur and Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${suggestedExam.image})` }}
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
          <h2 className="text-[#E9E7E2] font-libre-baskerville font-bold text-lg line-clamp-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
            {suggestedExam.title}
          </h2>
          <p className="text-[#E9E7E2]/80 font-libre-baskerville text-lg mt-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
            {suggestedExam.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestedExamHero;
