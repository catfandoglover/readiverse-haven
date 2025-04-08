import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateYourOwnCourseCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="w-full bg-[#19352F]/80 rounded-2xl cursor-pointer hover:bg-[#19352F] transition-colors p-6"
      onClick={() => navigate("/choose-your-own-course")}
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold">
          Choose Your Own
        </h3>
      </div>
      <div className="flex items-left justify-left mt-2 mb-3">
        <Plus className="h-4 w-4 text-[#CCFF23]" />
      </div>
    </div>
  );
};

export default CreateYourOwnCourseCard;
