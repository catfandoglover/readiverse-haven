
import React from "react";
import { Plus } from "lucide-react";

const CreateYourOwnCourseCard: React.FC = () => {
  const handleClick = () => {
    console.log("Create your own course card clicked");
  };

  return (
    <div 
      className="w-full bg-[#19352F]/80 rounded-2xl cursor-pointer hover:bg-[#19352F] transition-colors p-6"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-oxanium uppercase text-base text-[#E9E7E2] uppercase tracking-wider font-bold">
          Create Your Own
        </h3>
        <Plus className="h-4 w-4 text-[#CCFF23]" />
      </div>
      <p className="font-oxanium text-[#E9E7E2]/50 text-base">
        Design a personalized learning journey with Virgil as your guide
      </p>
    </div>
  );
};

export default CreateYourOwnCourseCard;
