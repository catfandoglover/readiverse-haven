
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
        toast.success("Check your email for the confirmation link");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-[#373763]">
          Full Name
        </Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Enter your full name"
          className="bg-white border-[#373763]/20 rounded-lg py-6 h-auto"
        />
      </div>

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
        <Label htmlFor="password" className="text-[#373763]">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Create a password"
          className="bg-white border-[#373763]/20 rounded-lg py-6 h-auto"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
      >
        {isLoading ? <LightningSpinner size="sm" /> : "Sign up"}
      </Button>

      <div className="text-center">
        <p className="text-[#332E38]/70">
          Already have an account?{" "}
          <Link to="/login" className="text-[#373763] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
