
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import SignUpForm from '@/components/auth/SignUpForm';
import { toast } from "sonner";

export function Register() {
  const location = useLocation();
  const state = location.state as { authError?: string; from?: Location };
  const [authError, setAuthError] = useState<string | null>(state?.authError || null);
  const { user, isLoading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  useEffect(() => {
    if (authError) {
      toast.error(authError);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setAuthError(null), 5000);
    }
  }, [authError]);
  
  // If already logged in, redirect to home or intended destination
  if (user && !isLoading) {
    const redirectTo = localStorage.getItem('authRedirectTo') || '/';
    localStorage.removeItem('authRedirectTo');
    return <Navigate to={redirectTo} replace />;
  }
  
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setAuthError(error.message);
      }
    } catch (err) {
      console.error('Google sign up error:', err);
      setAuthError('Failed to sign up with Google');
    } finally {
      setGoogleLoading(false);
    }
  };
  
  // Display loading spinner while checking auth state
  if (isLoading) {
    return (
      <AuthLayout title="Loading..." showBackButton={false}>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="text-[#373763]/70 mt-4">Checking authentication status...</p>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout 
      title={showEmailForm ? "Create an account" : "Sign up"}
      subtitle={showEmailForm ? "Enter your details to create an account" : "Create an account to continue"}
    >
      {showEmailForm ? (
        <SignUpForm />
      ) : (
        <div className="space-y-6">
          <GoogleSignInButton 
            onClick={handleGoogleSignup}
            isLoading={googleLoading}
            text="Sign up with Google"
          />
          
          <div className="relative flex items-center justify-center">
            <div className="flex-grow h-px bg-[#373763]/10"></div>
            <span className="px-4 text-[#332E38]/70 text-sm">or</span>
            <div className="flex-grow h-px bg-[#373763]/10"></div>
          </div>
          
          <button
            onClick={() => setShowEmailForm(true)}
            className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
          >
            Sign up with Email
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default Register;
