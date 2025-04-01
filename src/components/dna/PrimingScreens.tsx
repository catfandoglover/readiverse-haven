import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

interface PrimingScreensProps {
  onComplete: (name: string) => void;
  isPrefetching?: boolean;
  prefetchProgress?: number;
}

const PrimingScreens: React.FC<PrimingScreensProps> = ({ 
  onComplete,
  isPrefetching = false,
  prefetchProgress = 0
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [userName, setUserName] = useState('');

  const screens = [
    {
      title: "Welcome!",
      content: (
        <p className="font-libre-baskerville text-xl md:text-2xl text-center text-[#373763]">
          Before we dive in, let's get acquainted. What name would you like to use for this assessment?
        </p>
      ),
      input: (
        <Input 
          type="text" 
          placeholder="Enter your name" 
          className="w-full rounded-2xl py-6 bg-[#E9E7E2] text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      ),
    },
    {
      title: "Instructions",
      content: (
        <>
          <p className="font-libre-baskerville text-xl md:text-2xl text-center text-[#373763] mb-4">
            This assessment consists of a series of questions designed to help you understand your intellectual DNA.
          </p>
          <ul className="list-disc pl-5 text-[#373763]">
            <li>Read each question carefully.</li>
            <li>Answer honestly based on your beliefs.</li>
            <li>There are no right or wrong answers.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Privacy",
      content: (
        <>
          <p className="font-libre-baskerville text-xl md:text-2xl text-center text-[#373763] mb-4">
            Your responses will be kept confidential and used only to generate your personal intellectual DNA profile.
          </p>
          <p className="text-[#373763]">
            We do not share your data with third parties.
          </p>
        </>
      ),
    },
  ];

  const handleNextScreen = () => {
    setCurrentScreen((prev) => Math.min(prev + 1, screens.length - 1));
  };

  const renderContinueButton = () => {
    // When prefetching is happening on the final screen
    if (currentScreen === screens.length - 1 && isPrefetching) {
      return (
        <div className="w-full">
          <div className="mb-2 flex justify-between items-center text-xs text-[#373763]/60 font-oxanium">
            <span>Loading questions...</span>
            <span>{Math.round(prefetchProgress)}%</span>
          </div>
          <Progress 
            value={prefetchProgress}
            className="h-2 bg-[#373763]/20"
          />
          <Button 
            disabled
            className="w-full mt-4 py-6 rounded-2xl bg-[#373763]/70 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
          >
            PLEASE WAIT
          </Button>
        </div>
      );
    }
  
    // On the final screen, we show the complete button
    if (currentScreen === screens.length - 1) {
      return (
        <Button 
          onClick={() => onComplete(userName)}
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          START ASSESSMENT
        </Button>
      );
    }
  
    // For other screens, show the next button
    return (
      <Button 
        onClick={handleNextScreen}
        className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
      >
        CONTINUE
      </Button>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#E9E7E2] flex flex-col items-center justify-between overflow-hidden z-50">
      {/* No back button in header */}
      <header className="sticky top-0 w-full px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
        <div className="flex-1"></div> {/* Spacer */}
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl w-full px-6">
        <h2 className="font-oxanium uppercase text-[#332E38]/50 tracking-wider text-sm font-bold mb-4">
          {screens[currentScreen].title}
        </h2>
        <div className="mb-8">
          {screens[currentScreen].content}
        </div>
        {screens[currentScreen].input}
      </div>

      {/* Continue button */}
      <div className="w-full max-w-md mb-16 px-6">
        {renderContinueButton()}
      </div>
    </div>
  );
};

export default PrimingScreens;
