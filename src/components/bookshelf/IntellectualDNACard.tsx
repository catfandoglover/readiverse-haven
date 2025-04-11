import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
      <p className="font-oxanium text-[#E9E7E2]/50 text-base mt-4 mb-5">
        Explore texts from iconic thinkers that mirror and challenge your worldview. Organized by field, with Virgil as your guide through difficult passages.
      </p>
      <button
        className="uppercase tracking-wider flex items-center gap-1 font-oxanium text-[#E9E7E2]/50 pl-0 font-bold text-sm mt-auto"
        onClick={(e) => {
          e.stopPropagation();
          navigate("/intellectual-dna");
        }}
      >
        <span className="flex items-center">
          GET STARTED
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E9E7E2]/20 text-[#E9E7E2] ml-3">
            <ArrowRight className="h-4 w-4" />
          </span>
        </span>
      </button>
    </div>
  );
};

export default IntellectualDNACard;
