import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated via reset password flow
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Invalid or expired reset link");
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to update password");
        return;
      }

      setIsSubmitted(true);
      toast.success("Password updated successfully");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="ENTER NEW PASSWORD"
          className="w-full p-4 rounded-2xl bg-[#E9E7E2] text-[#373763] placeholder-[#282828] border border-[#373763]/20 focus:ring-2 focus:ring-[#373763]/30 focus:border-transparent font-oxanium text-sm font-bold uppercase-placeholder h-[52px]"
        />

        <Button
          type="submit"
          disabled={isLoading || isSubmitted}
          className="w-full h-[52px] rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          {isLoading ? <LightningSpinner size="sm" /> : "SET NEW PASSWORD"}
        </Button>
        
        <div className="flex justify-center text-sm">
          <button
            type="button"
            onClick={handleLogin}
            className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold hover:text-[#373763]"
          >
            BACK TO <span className="underline">LOGIN</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
