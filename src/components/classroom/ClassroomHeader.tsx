
import React from "react";
import MainMenu from "../navigation/MainMenu";

interface ClassroomHeaderProps {
  className?: string;
}

const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({ 
  className = ""
}) => {
  return (
    <div className={`flex items-center pt-4 pb-4 px-8 bg-[#1D3A35] text-[#E9E7E2] ${className}`}>
      <MainMenu />
      <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
        CLASSROOM
      </h2>
      <div className="w-10 h-10">
        {/* Empty div to balance the layout */}
      </div>
    </div>
  );
};

export default ClassroomHeader;
