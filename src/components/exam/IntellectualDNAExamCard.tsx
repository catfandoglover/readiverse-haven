
import React from "react";

const IntellectualDNAExamCard: React.FC = () => {
  return (
    <div 
      className="w-full bg-[#E9E7E2]/10 rounded-2xl p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(55, 55, 99, 0.1))' }}
    >
      <div className="relative z-10">
        <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold mb-1">
          Intellectual DNA Exam
        </h3>
        <p className="font-oxanium text-[#E9E7E2]/50 text-xs mb-2">
          Discover your intellectual strengths and philosophical alignments
        </p>
        <span className="inline-block bg-[#CCFF23]/20 text-[#CCFF23] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
          Coming Soon
        </span>
      </div>
    </div>
  );
};

export default IntellectualDNAExamCard;
