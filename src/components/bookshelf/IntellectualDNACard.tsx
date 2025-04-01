
import React from "react";
import { useNavigate } from "react-router-dom";

const IntellectualDNACard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/intellectual-dna");
  };

  return (
    <div 
      className="relative h-44 w-full bg-[#4A4351]/50 rounded-2xl cursor-pointer hover:bg-[#4A4351] transition-colors p-6 flex flex-col justify-between"
      onClick={handleClick}
    >
      <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2]/50 tracking-wider font-bold">
        Intellectual DNA
      </h3>
      <div>
        <h2 className="font-libre-baskerville font-bold text-lg text-[#E9E7E2]">
          Trace Your Intellectual DNA
        </h2>
        <p className="font-libre-baskerville text-[#E9E7E2]/80 text-base mt-1">
          Read the 60 classic texts from your kindred spirits and challenging voices
        </p>
      </div>
    </div>
  );
};

export default IntellectualDNACard;
