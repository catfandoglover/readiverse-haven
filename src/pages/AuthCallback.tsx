import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the auth callback from Supabase
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          toast.error('Authentication error: ' + error.message);
          return;
        }
        
        // Authentication successful
        toast.success('Successfully authenticated');
        
        // Get the original intended URL from local storage or default to home
        const redirectTo = localStorage.getItem('authRedirectTo') || '/';
        localStorage.removeItem('authRedirectTo');
        
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred');
        toast.error('Authentication error');
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  if (error) {
    // Map error messages to user-friendly text
    let errorMessage = "An authentication error occurred.";
    
    switch (error) {
      case "Invalid JWT":
      case "JWT expired":
        errorMessage = "Your login session has expired. Please sign in again.";
        break;
      case "Access token has expired":
        errorMessage = "Your access has expired. Please sign in again.";
        break;
      case "Invalid client id":
        errorMessage = "Authentication failed. Please try again or contact support.";
        break;
      case "Network error":
        errorMessage = "Network connection issue. Please check your internet connection.";
        break;
      default:
        errorMessage = `Authentication error: ${error}`;
    }
    
    return (
      <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md text-red-500 max-w-md">
          {errorMessage}
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-4 px-4 py-2 rounded bg-[#373763] text-white"
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
      <Spinner size="lg" />
      <div className="text-[#E9E7E2] font-oxanium mt-4">
        Processing your login...
      </div>
    </div>
  );
}

export default AuthCallback;