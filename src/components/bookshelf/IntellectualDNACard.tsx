
import React from "react";
import { useNavigate } from "react-router-dom";

const IntellectualDNACard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/intellectual-dna");
  };

  return (
    <div 
      className="w-full bg-[#4A4351]/50 rounded-xl cursor-pointer hover:bg-[#4A4351] transition-colors p-6 mb-4"
      onClick={handleClick}
    >
      <h3 className="font-oxanium text-base text-[#E9E7E2] uppercase tracking-wider font-bold">
        INTELLECTUAL DNA
      </h3>
      <p className="font-oxanium text-[#E9E7E2]/50 text-base">
        Domains of knowledge
      </p>
    </div>
  );
};

export default IntellectualDNACard;
