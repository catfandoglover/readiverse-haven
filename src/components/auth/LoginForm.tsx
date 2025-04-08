import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to log in");
        return;
      }

      // Get the redirect path or default to /
      const redirectTo = localStorage.getItem('authRedirectTo') || '/';
      localStorage.removeItem('authRedirectTo');

      navigate(redirectTo, { replace: true });
      toast.success("Successfully logged in");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-8">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="EMAIL"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border-none shadow-[0_0_0_1px_rgba(51,46,56,0.15)] focus:ring-1 focus:ring-[#332E38]/20 focus:shadow-none focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />

        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="PASSWORD"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border-none shadow-[0_0_0_1px_rgba(51,46,56,0.15)] focus:ring-1 focus:ring-[#332E38]/20 focus:shadow-none focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-[52px] rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          {isLoading ? <LightningSpinner size="sm" /> : "LOGIN"}
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

export default LoginForm;
