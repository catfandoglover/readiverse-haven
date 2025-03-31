
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { CreateCourseDialog } from "./CreateCourseDialog";

const CreateYourOwnCourseCard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div 
        className="w-full bg-[#19352F]/80 rounded-2xl cursor-pointer hover:bg-[#19352F] transition-colors p-6 flex flex-col"
        onClick={() => setIsDialogOpen(true)}
      >
        <div>
          <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold">
            Create Your Own Course
          </h3>
        </div>
        <div className="flex-grow flex items-end mt-2">
          <Plus className="h-4 w-4 text-[#CCFF23]" />
        </div>
      </div>

      <CreateCourseDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};

export default CreateYourOwnCourseCard;
