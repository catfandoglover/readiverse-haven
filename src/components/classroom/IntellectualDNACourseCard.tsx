
import React from "react";
import { useNavigate } from "react-router-dom";

const IntellectualDNACourseCard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // For the main course card, still navigate to the course page
    navigate("/intellectual-dna-course");
  };
  
  // For opening the chat directly
  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent card click
    navigate('/classroom-virgil-chat', { 
      state: { 
        courseData: {
          id: "dna-course",
          title: "Intellectual DNA",
          description: "Uncover your worldview",
          isDNA: true
        } 
      } 
    });
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
      <button 
        onClick={handleStartChat}
        className="mt-2 px-3 py-1.5 bg-[#373763] text-[#E9E7E2] text-xs rounded-lg font-oxanium hover:bg-[#373763]/90"
      >
        Start Session
      </button>
    </div>
  );
};

export default IntellectualDNACourseCard;
