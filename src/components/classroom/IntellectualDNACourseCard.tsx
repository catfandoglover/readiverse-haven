
import React from "react";
import { useNavigate } from "react-router-dom";

const IntellectualDNACourseCard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // When card is clicked, navigate to the course page
    navigate("/intellectual-dna-course");
  };

  return (
    <div 
      className="w-full bg-[#19352F]/80 rounded-2xl cursor-pointer hover:bg-[#19352F] transition-colors p-6"
      onClick={handleClick}
    >
      <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold mb-1">
        Intellectual DNA course
      </h3>
      <p className="font-oxanium text-[#E9E7E2]/50 text-xs mb-3">
        Uncover your worldview.
      </p>
    </div>
  );
};

export default IntellectualDNACourseCard;
