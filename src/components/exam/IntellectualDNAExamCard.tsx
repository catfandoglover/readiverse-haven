
import React, { useState } from "react";
import CreateExamDialog from "./CreateExamDialog";

const IntellectualDNAExamCard: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div 
        className="w-full bg-[#E9E7E2]/10 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity p-6"
        style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(55, 55, 99, 0.1))' }}
        onClick={() => setDialogOpen(true)}
      >
        <h3 className="font-oxanium uppercase text-xs text-[#E9E7E2] tracking-wider font-bold mb-1">
          Intellectual DNA exam
        </h3>
        <p className="font-oxanium text-[#E9E7E2]/50 text-xs mb-3">
          Test your worldview knowledge.
        </p>
      </div>

      <CreateExamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default IntellectualDNAExamCard;
