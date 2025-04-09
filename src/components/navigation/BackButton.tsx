import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  destination?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ destination = "/bookshelf" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(destination);
  };

  return (
    <button
      onClick={handleBack}
      className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
      aria-label="Back"
    >
      <ArrowLeft className="h-7 w-7" />
    </button>
  );
};

export default BackButton; 