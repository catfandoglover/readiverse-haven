
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PrimingScreensProps {
  onComplete: (name: string) => void;
  defaultName?: string;
}

const PrimingScreens = ({ onComplete, defaultName = "" }: PrimingScreensProps) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [name, setName] = useState(defaultName);
  const navigate = useNavigate();

  const screens = [
    {
      subtitle: "BEFORE WE GET STARTED",
      title: "Take a couple breaths.",
    },
    {
      subtitle: "THESE AREN'T YOUR TYPICAL QUESTIONS",
      title: "There are no wrong answers.",
    },
    {
      subtitle: "BECOME WHO YOU ARE",
      title: "Let’s get started.",
    },
  ];

  const handleContinue = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(prev => prev + 1);
    } else {
      // When we reach the last screen, complete the priming process
      onComplete(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#E9E7E2] flex flex-col items-center justify-between p-6 z-50 overflow-hidden">
      {/* Progress indicator */}
      <div className="w-full max-w-md flex justify-center pt-4">
        <div className="flex space-x-2">
          {screens.map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-8 rounded-full ${
                index <= currentScreen ? "bg-[#373763]" : "bg-[#373763]/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl w-full">
        <h2 className="font-oxanium uppercase text-[#332E38]/50 uppercase tracking-wider text-sm font-bold mb-4">
          {screens[currentScreen].subtitle}
        </h2>
        <h1 className="font-baskerville text-[#373763] text-4xl md:text-5xl leading-tight">
          {screens[currentScreen].title}
        </h1>
      </div>

      {/* Continue button */}
      <div className="w-full max-w-md mb-16">
        <Button 
          onClick={handleContinue}
          className="w-full py-6 rounded-full bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};

export default PrimingScreens;
