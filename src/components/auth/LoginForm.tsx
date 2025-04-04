
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#373763]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="bg-white border-[#373763]/20 rounded-lg py-6 h-auto"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-[#373763]">
            Password
          </Label>
          <Link 
            to="/forgot-password" 
            className="text-sm font-medium text-[#373763] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="bg-white border-[#373763]/20 rounded-lg py-6 h-auto"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
      >
        {isLoading ? <LightningSpinner size="sm" /> : "Log in"}
      </Button>

      <div className="text-center">
        <p className="text-[#332E38]/70">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#373763] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
