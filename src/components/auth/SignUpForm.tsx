import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";
import { storeAssessmentId, getStoredAssessmentId } from "@/utils/dnaAssessmentUtils";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure assessment ID is preserved when component mounts
  useEffect(() => {
    const assessmentId = getStoredAssessmentId();
    if (assessmentId) {
      console.log('SignUpForm: Reinforcing assessment ID storage for email signup:', assessmentId);
      storeAssessmentId(assessmentId);
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Preserve assessment ID before submitting
      const assessmentId = getStoredAssessmentId();
      if (assessmentId) {
        console.log('SignUpForm: Reinforcing assessment ID storage before form submission:', assessmentId);
        storeAssessmentId(assessmentId);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to sign up");
        return;
      }

      // Check if email confirmation is required
      const isDnaFlow = localStorage.getItem('authRedirectTo') === '/dna/welcome';
      
      if (isDnaFlow) {
        navigate('/dna/confirm-email', { replace: true });
      } else {
        // Navigate to the general email confirmation page
        navigate('/email-confirmation', { 
          replace: true,
          state: { fromSignup: true }
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSignUp} className="space-y-8">
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="WHAT IS YOUR NAME?"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border border-[#373763]/20 focus:ring-2 focus:ring-[#373763]/30 focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />

        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="ENTER EMAIL"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border border-[#373763]/20 focus:ring-2 focus:ring-[#373763]/30 focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />

        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="ENTER PASSWORD"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border border-[#373763]/20 focus:ring-2 focus:ring-[#373763]/30 focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-[52px] rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          {isLoading ? <LightningSpinner size="sm" /> : "SIGN UP"}
        </Button>
        
        <div className="flex justify-between text-sm">
          <button 
            type="button" 
            onClick={handleResetPassword}
            className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold hover:text-[#373763] underline"
          >
            RESET PASSWORD
          </button>
          
          <button
            type="button"
            onClick={handleLogin}
            className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold hover:text-[#373763]"
          >
            EXISTING USER? <span className="underline">LOGIN</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
