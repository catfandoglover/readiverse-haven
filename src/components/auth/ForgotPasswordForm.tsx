
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="bg-[#373763]/10 p-6 rounded-lg mb-6">
          <p className="text-[#373763] mb-3">
            If an account exists with the email <strong>{email}</strong>, you will receive a password reset link shortly.
          </p>
          <p className="text-[#332E38]/70">
            Check your inbox and spam folders.
          </p>
        </div>
        <Link to="/login">
          <Button
            type="button"
            className="bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm py-6 rounded-2xl uppercase tracking-wider"
          >
            Return to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
      >
        {isLoading ? <LightningSpinner size="sm" /> : "Reset Password"}
      </Button>

      <div className="text-center">
        <p className="text-[#332E38]/70">
          Remember your password?{" "}
          <Link to="/login" className="text-[#373763] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
