import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  destination?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ destination = "/bookshelf" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(destination);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleBack}
      className="text-[#E9E7E2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] p-1"
    >
      <ChevronLeft className="h-7.5 w-7.5" />
    </Button>
  );
};

export default BackButton; 