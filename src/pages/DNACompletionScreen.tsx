
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Check } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { toast } from "sonner";

const DNACompletionScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Store that DNA assessment is complete to redirect after auth
  useEffect(() => {
    localStorage.setItem('dnaAssessmentComplete', 'true');
    localStorage.setItem('authRedirectTo', '/dna/welcome');
  }, []);

  // If user is already logged in, redirect to results
  useEffect(() => {
    if (user) {
      navigate('/dna/welcome');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      toast.error('Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = () => {
    navigate('/register');
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

      {/* Auth buttons */}
      <div className="w-full max-w-md mb-16 px-6 space-y-4">
        <GoogleSignInButton 
          onClick={handleGoogleLogin} 
          isLoading={googleLoading}
          text="Continue with Google"
        />
        
        <div className="relative flex items-center justify-center">
          <div className="flex-grow h-px bg-[#373763]/10"></div>
          <span className="px-4 text-[#332E38]/70 text-sm">or</span>
          <div className="flex-grow h-px bg-[#373763]/10"></div>
        </div>
        
        <Button 
          onClick={handleEmailAuth}
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          CONTINUE WITH EMAIL
        </Button>
      </div>
    </div>
  );
};

export default DNACompletionScreen;
