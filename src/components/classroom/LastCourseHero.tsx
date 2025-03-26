
import React from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const LastCourseHero = () => {
  const navigate = useNavigate();
  
  // For now, we'll use a static fallback since we don't have real course data yet
  const lastCourse = {
    title: "Intellectual DNA",
    description: "Uncover your Worldview",
    coverUrl: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    isDefault: true
  };
  
  const handleResumeCourse = () => {
    console.log('LastCourseHero - Resume course clicked');
  };

  return (
    <div className="px-4 mb-6">
      <div 
        className="relative h-44 w-full rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleResumeCourse}
      >
        {/* Background Image with Blur and Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${lastCourse.coverUrl})` }}
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
              {lastCourse.title}
            </h2>
            <p className="text-[#E9E7E2]/80 font-baskerville text-lg mt-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
              {lastCourse.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastCourseHero;
