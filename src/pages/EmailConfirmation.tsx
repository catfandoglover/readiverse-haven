import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Inbox } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LightningSpinner } from '@/components/ui/lightning-spinner';
import AuthLayout from "@/components/auth/AuthLayout";

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if the user came from DNA flow to customize the message
  const isDnaFlow = location.state?.fromDna || 
                    localStorage.getItem('authRedirectTo') === '/dna/welcome';

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

      // Email is verified, redirect to appropriate destination
      const redirectPath = localStorage.getItem('authRedirectTo') || '/';
      localStorage.removeItem('authRedirectTo');
      
      navigate(redirectPath);
    } catch (error) {
      console.error('Error checking email verification:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Check your email"
      subtitle={`JOIN THE GREAT CONVERSATION${isDnaFlow ? "\nConfirm your email to view your results" : "\nConfirm your email to continue"}`}
      showBackButton={false}
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="rounded-full bg-[#373763]/10 p-4">
          <Inbox className="h-8 w-8 text-[#373763]" />
        </div>

        <p className="text-[#332E38]/70 text-center">
          We've sent a confirmation email to your inbox. Please click the link in the email to verify your account.
        </p>

        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          {isLoading ? <LightningSpinner size="sm" /> : "I'VE CONFIRMED MY EMAIL"}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default EmailConfirmation;
