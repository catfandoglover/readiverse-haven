
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Inbox } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LightningSpinner } from '@/components/ui/lightning-spinner';

const DNAEmailConfirmationScreen = () => {
  const navigate = useNavigate();
  const { openLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        toast.error('Error checking session: ' + sessionError.message);
        // Open login if no valid session
        navigate('/login');
        return;
      }

      if (!session) {
        // No session, redirect to login
        navigate('/login');
        return;
      }

      // Check if email is verified
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        toast.error('Error getting user details');
        return;
      }

      if (!user?.email_confirmed_at) {
        toast.error('Please confirm your email before continuing');
        return;
      }

      // Email is verified, redirect to welcome page
      navigate('/dna/welcome');
    } catch (error) {
      console.error('Error checking email verification:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
            <Inbox className="h-8 w-8 text-[#373763]" />
          </div>
        </div>
        <h2 className="font-oxanium uppercase text-[#332E38]/50 tracking-wider text-sm font-bold mb-4">
          CHECK YOUR EMAIL
        </h2>
        <h1 className="font-libre-baskerville font-bold text-[#373763] text-3xl md:text-5xl leading-tight mb-8">
          Confirm your email to view your results
        </h1>
      </div>

      {/* Continue button */}
      <div className="w-full max-w-md mb-16 px-6">
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          {isLoading ? <LightningSpinner size="sm" /> : "I'VE CONFIRMED MY EMAIL"}
        </Button>
      </div>
    </div>
  );
};

export default DNAEmailConfirmationScreen;
