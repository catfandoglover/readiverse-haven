import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from '@/integrations/supabase/client';
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { toast } from "sonner";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { storeAssessmentId, getStoredAssessmentId } from "@/utils/dnaAssessmentUtils";

const DNACompletionScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Ensure the assessment ID is stored in all storage mechanisms
  useEffect(() => {
    // Make sure the assessment ID is properly stored in all storage locations
    const assessmentId = getStoredAssessmentId();
    if (assessmentId) {
      console.log('DNACompletionScreen: Reinforcing assessment ID storage for login/registration:', assessmentId);
      storeAssessmentId(assessmentId);
    } else {
      console.warn('DNACompletionScreen: No assessment ID found to store!');
    }
    
    // Store that DNA assessment is complete to redirect after auth
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
      // Double-check the assessment ID is properly stored before redirecting
      const assessmentId = getStoredAssessmentId();
      if (assessmentId) {
        console.log('Reinforcing assessment ID storage before Google login:', assessmentId);
        storeAssessmentId(assessmentId);
      } else {
        console.warn('No assessment ID found before Google login!');
      }
      
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
    // Double-check the assessment ID is properly stored before navigation
    const assessmentId = getStoredAssessmentId();
    if (assessmentId) {
      console.log('Reinforcing assessment ID storage before email registration:', assessmentId);
      storeAssessmentId(assessmentId);
    } else {
      console.warn('No assessment ID found before email registration!');
    }
    
    navigate('/register', { state: { showEmailForm: true } });
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
        <h1 className="text-3xl font-libre-baskerville font-bold text-[#373763] mb-6 text-center">Get your results</h1>
      </div>

      {/* Bottom section with buttons - positioned at bottom */}
      <div className="w-full max-w-md mx-auto mb-16 px-6">
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full h-[52px] rounded-2xl bg-[#373763] text-[#F9F9F9] font-medium flex items-center justify-center gap-3 hover:bg-[#373763]/90 transition-colors border border-[#373763] shadow-sm"
        >
          {googleLoading ? (
            <LightningSpinner size="sm" />
          ) : (
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
        
        <div className="text-center mt-4">
          <button
            onClick={handleEmailAuth}
            className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold hover:text-[#373763]"
          >
            CONTINUE WITH EMAIL
          </button>
        </div>
      </div>
    </div>
  );
};

export default DNACompletionScreen;
