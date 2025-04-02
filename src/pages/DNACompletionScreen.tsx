import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Check } from "lucide-react";

const DNACompletionScreen = () => {
  const navigate = useNavigate();
  const { openLogin, user } = useAuth();

  // If user is already logged in, redirect to results
  React.useEffect(() => {
    if (user) {
      navigate('/dna/welcome');
    }
  }, [user, navigate]);

  const handleLoginClick = () => {
    // Open the Outseta login/register modal
    openLogin({
      widgetMode: 'login|register', // Keep the combined mode as requested
    });
  };

  return (
    <div className="fixed inset-0 bg-[#E9E7E2] flex flex-col items-center justify-between overflow-hidden z-50">
      {/* No back button in header */}
      <header className="sticky top-0 w-full px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
        <div className="flex-1"></div> {/* Spacer */}
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl w-full px-6">
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-[#373763]/10 p-4">
            <Check className="h-8 w-8 text-[#373763]" />
          </div>
        </div>
        <h2 className="font-oxanium uppercase text-[#332E38]/50 tracking-wider text-sm font-bold mb-4">
          ASSESSMENT COMPLETED
        </h2>
        <h1 className="font-libre-baskerville font-bold text-[#373763] text-3xl md:text-5xl leading-tight mb-8">
          Create an account or login to view your results
        </h1>
      </div>

      {/* Continue button */}
      <div className="w-full max-w-md mb-16 px-6">
        <Button 
          onClick={handleLoginClick}
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider dna-continue-button"
        >
          LOGIN / REGISTER
        </Button>
      </div>
    </div>
  );
};

export default DNACompletionScreen;
