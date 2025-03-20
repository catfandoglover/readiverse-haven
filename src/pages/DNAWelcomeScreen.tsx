
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const DNAWelcomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ensure user is authenticated for this screen
  useEffect(() => {
    if (!user) {
      navigate('/dna/confirm-email');
    }
  }, [user, navigate]);

  const handleContinue = () => {
    // Navigate to Virgil welcome screen
    navigate('/virgil/welcome');
  };

  return (
    <div className="fixed inset-0 bg-[#E9E7E2] flex flex-col items-center justify-between overflow-hidden z-50">
      <header className="sticky top-0 w-full px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
        <div className="flex-1"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl w-full px-6">
        <h2 className="font-oxanium uppercase text-[#332E38]/50 tracking-wider text-sm font-bold mb-4">
          WELCOME
        </h2>
        <h1 className="font-baskerville text-[#373763] text-4xl md:text-5xl leading-tight mb-8">
          Your Intellectual DNA Results Are Ready
        </h1>
        <p className="text-[#373763]/70 mb-8">
          Thanks for confirming your email. You're now ready to explore your intellectual profile with our guide, Virgil.
        </p>
      </div>

      <div className="w-full max-w-md mb-16 px-6">
        <Button 
          onClick={handleContinue}
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          MEET VIRGIL
        </Button>
      </div>
    </div>
  );
};

export default DNAWelcomeScreen;
