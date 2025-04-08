import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import { LightningSpinner } from '@/components/ui/lightning-spinner';
import { toast } from 'sonner';
import { linkPendingAssessmentToUser, getStoredAssessmentId, storeAssessmentId, clearStoredAssessmentId } from '@/utils/dnaAssessmentUtils';

// Helper function to get assessment ID from cookies
const getAssessmentIdFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('dna_assessment_id=')) {
      return cookie.substring('dna_assessment_id='.length);
    }
  }
  return null;
};

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Handle the auth callback from Supabase
    const handleAuthCallback = async () => {
      try {
        // Extract assessment ID from URL query parameters if present
        const queryParams = new URLSearchParams(location.search);
        const queryAssessmentId = queryParams.get('assessment_id');
        
        // Check if this callback is from the DNA assessment flow
        const isDnaFlow = localStorage.getItem('dnaAssessmentComplete') === 'true';
        
        // Get the assessment ID from all potential sources
        const pendingAssessmentId = getStoredAssessmentId() || queryAssessmentId;
        
        // If we have an assessment ID from query but not storage, store it properly
        if (queryAssessmentId && !getStoredAssessmentId()) {
          console.log('Found assessment ID in URL query, storing it properly:', queryAssessmentId);
          storeAssessmentId(queryAssessmentId);
        }
        
        console.log('Assessment ID in auth callback:', {
          finalChoice: pendingAssessmentId,
          isDnaFlow,
          url: window.location.href
        });
        
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          toast.error('Authentication error: ' + error.message);
          return;
        }
        
        // Authentication successful
        const user = sessionData?.session?.user;
        
        // Check if this is a new user who needs to confirm their email
        if (user && !user.email_confirmed_at) {
          console.log('New user needs to confirm email');
          // Redirect to email confirmation page
          const isDnaFlow = localStorage.getItem('authRedirectTo') === '/dna/welcome';
          
          if (isDnaFlow) {
            navigate('/dna/confirm-email', { replace: true });
          } else {
            navigate('/email-confirmation', { 
              replace: true,
              state: { fromSignup: true }
            });
          }
          return;
        }
        
        // If we have a pending assessment ID and a valid user, link them now
        if (pendingAssessmentId && user) {
          console.log('Auth callback: Found assessment ID to link:', pendingAssessmentId);
          
          // Ensure it's stored in all storage mechanisms for redundancy
          storeAssessmentId(pendingAssessmentId);
          
          // Instead of manually updating the profile, use the utility with retries
          try {
            const linkResult = await linkPendingAssessmentToUser(user.id, 5, 2000);
            
            if (linkResult.success) {
              console.log('Successfully linked assessment to profile using utility!');
              toast.success('Your assessment results are ready to view!');
            } else if (linkResult.hasExistingAssessment) {
              console.log('User already has an existing assessment:', linkResult.existingAssessmentId);
              toast.info(linkResult.message || 'You already have a completed assessment.');
            } else {
              console.error('Failed to link assessment:', linkResult.message);
              toast.error(linkResult.message || 'Failed to link your assessment results');
            }
          } catch (err) {
            console.error('Error in assessment linking process:', err);
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
  }, [navigate, location]);
  
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
