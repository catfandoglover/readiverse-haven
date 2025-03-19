
import React from "react";
import { useNavigate } from "react-router-dom";
import PrimingScreens from "@/components/dna/PrimingScreens";

const DNAPriming: React.FC = () => {
  const navigate = useNavigate();

  const handlePrimingComplete = () => {
    // When priming is complete, navigate to the first ethics question
    navigate("/dna/ethics");
  };

  return (
    <PrimingScreens onComplete={handlePrimingComplete} />
  );
};

export default DNAPriming;
