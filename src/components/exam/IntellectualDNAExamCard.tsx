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
      className="w-full bg-[#E9E7E2]/10 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity p-6"
      style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(55, 55, 99, 0.1))' }}
      onClick={handleClick}
    >
      <div className="flex items-start mb-2">
        <div className="mr-2 mt-1">
          <div className="h-5 w-5 rounded-full bg-[#CCFF23]/80 flex items-center justify-center"></div>
        </div>
        <div>
          <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold mb-1">
            Intellectual DNA
          </h3>
          <p className="font-oxanium text-[#E9E7E2]/50 text-xs mb-1">
            Test your worldview and earn badges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntellectualDNAExamCard;
