
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { toast } from "sonner";
import { Link } from 'react-router-dom';

export function Register() {
  const [authError, setAuthError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  
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
        toast.error(error.message);
      }
    } catch (err) {
      console.error('Google sign up error:', err);
      setAuthError('Failed to sign up with Google');
      toast.error('Failed to sign up with Google');
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
      title="Login"
      subtitle="WELCOME BACK TO THE GREAT CONVERSATION"
      showLightningLogo={true}
      verticalCenter={false}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow"></div>
        
        <div className="space-y-8">
          <GoogleSignInButton 
            onClick={handleGoogleSignup}
            isLoading={googleLoading}
            text="Continue with Google"
            onError={(error) => setAuthError(error)}
            className="mb-6"
          />
          
          <Link
            to="/login"
            className="block text-center text-[#373763] font-oxanium text-sm uppercase tracking-wider"
          >
            Sign in with Email
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Register;
