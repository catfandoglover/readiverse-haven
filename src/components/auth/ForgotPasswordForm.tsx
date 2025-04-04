import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setIsSubmitted(true);
      toast.success("Check your email for the password reset link");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-[#373763]/10 p-6 rounded-2xl mb-8">
          <p className="text-[#373763] mb-3">
            If an account exists with the email <strong>{email}</strong>, you will receive a password reset link shortly.
          </p>
          <p className="text-[#332E38]/70">
            Check your inbox and spam folders.
          </p>
        </div>
        
        <Button
          type="button"
          onClick={handleLogin}
          className="w-full h-[52px] rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          RETURN TO LOGIN
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="ENTER EMAIL"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border border-[#373763]/20 focus:ring-2 focus:ring-[#373763]/30 focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-[52px] rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          {isLoading ? <LightningSpinner size="sm" /> : "RESET PASSWORD"}
        </Button>
        
        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={handleLogin}
            className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold hover:text-[#373763]"
          >
            BACK TO <span className="underline">LOGIN</span>
          </button>
          
          <button
            type="button"
            onClick={handleSignUp}
            className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold hover:text-[#373763]"
          >
            NEW USER? <span className="underline">SIGNUP</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
