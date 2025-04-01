
import React from "react";
import { useNavigate } from "react-router-dom";

const SuggestedCourseHero: React.FC = () => {
  const navigate = useNavigate();
  
  // Using the same exam data format from LastExamHero as a placeholder
  const suggestedCourse = {
    id: "course1",
    title: "First Principles",
    description: "Stripping away assumptions to reach bedrock truth",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Concept_Images/First%20principles.png"
  };
  
  const handleStartCourse = () => {
    // Navigation will be implemented in future
    console.log('SuggestedCourseHero - Start course clicked');
  };

  return (
    <div className="relative h-44 w-full rounded-2xl overflow-hidden cursor-pointer"
      onClick={handleStartCourse}
    >
      {/* Background Image with Blur and Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${suggestedCourse.image})` }}
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
            {suggestedCourse.title}
          </h2>
          <p className="text-[#E9E7E2]/80 font-libre-baskerville text-lg mt-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
            {suggestedCourse.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestedCourseHero;
