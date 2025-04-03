import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Spinner } from '@/components/ui/spinner';

export function Login() {
  const location = useLocation();
  const state = location.state as { tab?: string; authError?: string; from?: Location };
  const initialTab = state?.tab || 'signin';
  const [authError, setAuthError] = useState<string | null>(state?.authError || null);
  const { user, isLoading } = useAuth();
  
  // If already logged in, redirect to home or intended destination
  if (user && !isLoading) {
    const redirectTo = localStorage.getItem('authRedirectTo') || '/';
    localStorage.removeItem('authRedirectTo');
    return <Navigate to={redirectTo} replace />;
  }
  
  // Handle Supabase Auth UI errors
  const handleAuthError = (errorMsg: string) => {
    setAuthError(errorMsg);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setAuthError(null), 5000);
  };
  
  // Display loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
        <Spinner size="lg" />
        <p className="text-[#E9E7E2] mt-4 font-oxanium">Checking authentication status...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#E9E7E2] mb-6 text-center font-oxanium">
          Welcome to Readiverse Haven
        </h1>
        
        {authError && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md text-red-500 mb-4">
            {authError}
          </div>
        )}
        
        <Auth
          supabaseClient={supabase}
          view={initialTab === 'signup' ? 'sign_up' : 'sign_in'}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#373763',
                  brandAccent: '#3E3E71',
                  inputBackground: '#1E1C1E',
                  inputText: '#E9E7E2',
                  inputBorder: '#3E3E71',
                  inputBorderFocus: '#5656A5',
                  inputBorderHover: '#5656A5',
                  dividerBackground: '#3E3E71',
                }
              }
            },
            className: {
              container: 'auth-container',
              label: 'auth-label text-[#E9E7E2]',
              button: 'auth-button',
              input: 'auth-input',
              message: 'text-[#E9E7E2]',
              anchor: 'text-[#5656A5] hover:text-[#7272D0]',
            }
          }}
          providers={[]} // No social providers as per requirements
          redirectTo={`${window.location.origin}/auth/callback`}
          onError={(error) => handleAuthError(error.message)}
          options={{
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: true,
            signUpFields: {
              full_name: {
                label: 'Full Name',
                placeholder: 'John Doe',
                required: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default Login;