
import React from "react";
import { useNavigate } from "react-router-dom";

const IntellectualDNACard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/intellectual-dna");
  };

  return (
    <div 
      className="w-full h-full bg-[#4A4351]/50 rounded-2xl cursor-pointer hover:bg-[#4A4351] transition-colors p-6"
      onClick={handleClick}
    >
      <h3 className="font-oxanium uppercase text-base text-[#E9E7E2] uppercase tracking-wider font-bold">
        Intellectual DNA
      </h3>
      <p className="font-oxanium text-[#E9E7E2]/50 text-base mt-2">
        60 texts from iconic thinkers that align and challenge your worldview, organized by field. If you need help with a difficult passage or text, Virgil is always there as your guide.
      </p>
    </div>
  );
};

export default IntellectualDNACard;
