import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import { LightningSpinner } from '@/components/ui/lightning-spinner';
import { toast } from 'sonner';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the auth callback from Supabase
    const handleAuthCallback = async () => {
      try {
        // Check if this callback is from the DNA assessment flow
        const isDnaFlow = localStorage.getItem('dnaAssessmentComplete') === 'true';
        const pendingAssessmentId = localStorage.getItem('pending_dna_assessment_id');
        
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          toast.error('Authentication error: ' + error.message);
          return;
        }
        
        // Authentication successful
        const user = sessionData?.session?.user;
        
        // If we have a pending assessment ID and a valid user, link them now
        if (isDnaFlow && pendingAssessmentId && user) {
          console.log('Auth callback: Found pending assessment to link:', pendingAssessmentId);
          
          try {
            // First get the user's profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('Error fetching profile:', profileError);
              // Continue with navigation anyway
            } else if (profileData) {
              // Update the profile with the assessment ID
              console.log(`Updating profile ${profileData.id} with assessment ID: ${pendingAssessmentId}`);
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ assessment_id: pendingAssessmentId })
                .eq('id', profileData.id);
                
              if (updateError) {
                console.error('Error updating profile:', updateError);
              } else {
                console.log('Successfully linked assessment to profile!');
                toast.success('Your assessment results are ready to view!');
                
                // Clear storage now that we've successfully linked
                localStorage.removeItem('pending_dna_assessment_id');
                sessionStorage.removeItem('dna_assessment_to_save');
              }
            }
          } catch (err) {
            console.error('Error linking assessment:', err);
          }
        }
        
        toast.success('Successfully authenticated');
        
        // Get the original intended URL from local storage or default to home
        let redirectTo = localStorage.getItem('authRedirectTo') || '/';
        
        // Special handling for DNA flow
        if (isDnaFlow) {
          localStorage.removeItem('dnaAssessmentComplete');
          redirectTo = '/dna/welcome';
        }
        
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
      <AuthLayout title="Authentication Error" showBackButton={false}>
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg text-red-500 max-w-md mb-6">
          {errorMessage}
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
        >
          Return to Login
        </button>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout title="Processing Login" showBackButton={false}>
      <div className="flex flex-col items-center justify-center py-12">
        <LightningSpinner size="lg" />
        <p className="text-[#373763] font-oxanium mt-6">
          Processing your login...
        </p>
      </div>
    </AuthLayout>
  );
}

export default AuthCallback;
