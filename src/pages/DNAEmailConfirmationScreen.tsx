import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LightningSpinner } from '@/components/ui/lightning-spinner';

const DNAEmailConfirmationScreen = () => {
  const navigate = useNavigate();
  const { openLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFromSignup, setIsFromSignup] = useState(false);

  // Check if this is a new account on component mount
  useEffect(() => {
    const checkAccount = async () => {
      // Check if user has a session already
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        // If email isn't confirmed yet, they are a new signup
        setIsFromSignup(!userData.user?.email_confirmed_at);
      }
    };
    
    checkAccount();
  }, []);

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
        // For new signups who haven't confirmed email, redirect to login
        if (isFromSignup) {
          toast.success('Please check your email and confirm your account, then log in.');
          navigate('/login', { replace: true });
          return;
        } else {
          toast.error('Please confirm your email before continuing');
          return;
        }
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
    <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] grid grid-rows-[auto_1fr_auto] py-6">
      {/* Top nav section */}
      <div className="px-6">
        <div className="relative">
          {/* No back button in header */}
        </div>
      </div>

      {/* Center content with vertical alignment */}
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-6">
        <div className="w-36 h-36 mb-10">
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning%20Hexagon.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZyBIZXhhZ29uLnBuZyIsImlhdCI6MTc0MzczODUzMiwiZXhwIjo4ODE0MzY1MjEzMn0.nqjOMHSqPwcszVHj-OUBxUHDP1OEMBkkg8GceJiY0TY"
            alt="Lightning logo"
            width={144}
            height={144}
            className="w-full h-full"
          />
        </div>
        <h1 className="text-3xl font-libre-baskerville font-bold text-[#373763] mb-6 text-center">Confirm your email to gain access</h1>
      </div>

      {/* Bottom section with buttons - positioned at bottom */}
      <div className="w-full max-w-md mx-auto mb-16 px-6">
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
