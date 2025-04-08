import React from "react";
import { useNavigate } from "react-router-dom";

const IntellectualDNAExamCard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // When card is clicked, navigate to the exam page
    navigate("/intellectual-dna-exam");
  };

  return (
    <div 
      className="w-full bg-[#373763]/80 rounded-2xl cursor-pointer hover:bg-[#373763] transition-colors p-6"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold">
          Intellectual DNA
        </h3>
      </div>
      <p className="font-oxanium text-[#E9E7E2]/50 text-xs mt-2">
        Test your worldview and earn badges.
      </p>
    </div>
  );
};

export default IntellectualDNAExamCard;
