import React, { useState } from "react";
import { Plus } from "lucide-react";
import CreateExamDialog from "./CreateExamDialog";

const CreateYourOwnExamCard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div 
        className="w-full bg-[#373763]/80 rounded-2xl cursor-pointer hover:bg-[#373763] transition-colors p-6"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold">
            Choose Your Own Exam
          </h3>
        </div>
        <div className="flex items-left justify-left mt-2">
          <Plus className="h-4 w-4 text-[#CCFF23]" />
        </div>
      </div>

      <CreateExamDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};

export default CreateYourOwnExamCard;
