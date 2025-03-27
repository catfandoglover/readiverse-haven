
import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExamOption {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface CreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  // Sample exam options
  const examOptions: ExamOption[] = [
    {
      id: "ethics-morality",
      title: "Ethics & Morality",
      description: "Test your knowledge of ethical frameworks and moral reasoning",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "critical-thinking",
      title: "Critical Thinking",
      description: "Evaluate your analytical skills and logical reasoning",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "political-philosophy",
      title: "Political Philosophy",
      description: "Test your understanding of political systems and theories",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "epistemology",
      title: "Epistemology",
      description: "Explore your understanding of knowledge and belief systems",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    }
  ];

  const handleSelectExam = (exam: ExamOption) => {
    // Close the dialog
    onOpenChange(false);
    
    // Navigate to the exam with the selected option
    navigate('/exam-virgil-chat', { 
      state: { 
        examData: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          image: exam.image
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#3D3D6F] text-[#E9E7E2] border-[#4D4D8F] sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-between mb-4">
          <DialogTitle className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-lg">
            Select an Exam
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#373763]"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-3">
          {examOptions.map((exam) => (
            <div
              key={exam.id}
              className="rounded-lg p-4 cursor-pointer hover:bg-[#373763] transition-colors"
              style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.05), rgba(77, 77, 143, 0.1))' }}
              onClick={() => handleSelectExam(exam)}
            >
              <div className="flex items-center">
                {exam.image && (
                  <div className="w-12 h-12 rounded-md overflow-hidden mr-4 flex-shrink-0">
                    <img 
                      src={exam.image} 
                      alt={exam.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold">{exam.title}</h3>
                  <p className="text-xs text-[#E9E7E2]/70">{exam.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#4D4D8F]">
          <p className="text-xs text-[#E9E7E2]/60 text-center">
            Complete these exams to earn badges and track your philosophical knowledge
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamDialog;
