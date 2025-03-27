
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateYourOwnExamCard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // For now, just navigate to a sample exam
    const customExam = {
      id: "custom-exam",
      title: "Custom Philosophy Exam",
      description: "A personalized test of your philosophical knowledge"
    };
    
    navigate('/exam-virgil-chat', { 
      state: { 
        examData: customExam
      }
    });
  };

  return (
    <div 
      className="w-full bg-[#373763]/80 rounded-2xl cursor-pointer hover:bg-[#373763] transition-colors p-6"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold">
          Create Your Own Exam
        </h3>
      </div>
      <div className="flex items-left justify-left mt-2">
        <Plus className="h-4 w-4 text-[#CCFF23]" />
      </div>
    </div>
  );
};

export default CreateYourOwnExamCard;
