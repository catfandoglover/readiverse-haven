
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ExamOption {
  id: string;
  title: string;
  description: string;
  category: "philosophical" | "literary" | "historical" | "custom";
  image?: string;
}

interface CreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("philosophical");
  const navigate = useNavigate();

  // Sample exam options
  const examOptions: ExamOption[] = [
    {
      id: "ethics-morality",
      title: "Ethics & Morality",
      description: "Test your knowledge of ethical frameworks and moral reasoning",
      category: "philosophical",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "critical-thinking",
      title: "Critical Thinking",
      description: "Evaluate your analytical skills and logical reasoning",
      category: "philosophical",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "existentialism",
      title: "Existentialism",
      description: "Explore your understanding of existence, meaning, and choice",
      category: "philosophical",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "literary-theory",
      title: "Literary Theory",
      description: "Test your understanding of literary analysis and criticism",
      category: "literary",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "narrative-structures",
      title: "Narrative Structures",
      description: "Evaluate your knowledge of storytelling patterns and techniques",
      category: "literary",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "ancient-philosophy",
      title: "Ancient Philosophy",
      description: "Test your knowledge of ancient philosophical traditions",
      category: "historical",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "enlightenment",
      title: "The Enlightenment",
      description: "Explore your understanding of Enlightenment thinkers and ideas",
      category: "historical",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "custom-exam",
      title: "Create From Scratch",
      description: "Design your own custom philosophical examination",
      category: "custom",
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    }
  ];

  // Filter exams based on search query and active tab
  const filteredExams = examOptions.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || exam.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleSelectExam = (exam: ExamOption) => {
    // Close the dialog
    onOpenChange(false);
    
    // Show toast notification
    toast.success(`${exam.title} exam selected`, {
      description: "Starting your examination session...",
      duration: 3000,
    });
    
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
      <DialogContent className="bg-[#3D3D6F] border-[#4D4D8F] text-[#E9E7E2] p-0 overflow-hidden sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-2">
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
        
        <div className="p-6 pt-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#E9E7E2]/50" />
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#373763]/50 border-[#4D4D8F] text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 focus-visible:ring-[#CCFF23]/30"
            />
          </div>
          
          <Tabs defaultValue="philosophical" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4 bg-[#373763]/30 p-0.5">
              <TabsTrigger 
                value="philosophical" 
                className="data-[state=active]:bg-[#373763] data-[state=active]:text-[#E9E7E2] text-[#E9E7E2]/70 text-xs"
              >
                Philosophical
              </TabsTrigger>
              <TabsTrigger 
                value="literary" 
                className="data-[state=active]:bg-[#373763] data-[state=active]:text-[#E9E7E2] text-[#E9E7E2]/70 text-xs"
              >
                Literary
              </TabsTrigger>
              <TabsTrigger 
                value="historical" 
                className="data-[state=active]:bg-[#373763] data-[state=active]:text-[#E9E7E2] text-[#E9E7E2]/70 text-xs"
              >
                Historical
              </TabsTrigger>
              <TabsTrigger 
                value="custom" 
                className="data-[state=active]:bg-[#373763] data-[state=active]:text-[#E9E7E2] text-[#E9E7E2]/70 text-xs"
              >
                Custom
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredExams.map((exam) => (
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
                
                {filteredExams.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#E9E7E2]/70 text-sm">No exams found matching your search.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamDialog;
