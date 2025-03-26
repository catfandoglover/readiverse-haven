
import React from "react";

const IntellectualDNACourseCard: React.FC = () => {
  const handleClick = () => {
    console.log("Intellectual DNA course card clicked");
  };

  return (
    <div 
      className="w-full bg-[#19352F]/80 rounded-2xl cursor-pointer hover:bg-[#19352F] transition-colors p-6"
      onClick={handleClick}
    >
      <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold">
        Intellectual DNA
      </h3>
      <p className="font-oxanium text-[#E9E7E2]/50 text-xs">
        Uncover your worldview.
      </p>
    </div>
  );
};

export default IntellectualDNACourseCard;
