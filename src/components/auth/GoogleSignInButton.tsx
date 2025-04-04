
import React from "react";
import { Button } from "@/components/ui/button";
import { LightningSpinner } from "@/components/ui/lightning-spinner";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  onClick: () => Promise<void>;
  isLoading?: boolean;
  text?: string;
  onError?: (error: string) => void;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onClick, 
  isLoading = false,
  text = "Continue with Google",
  onError,
  className = ""
}) => {
  const handleClick = async () => {
    try {
      await onClick();
    } catch (error: any) {
      console.error("Google Sign In error:", error);
      const errorMessage = error?.message || "Failed to sign in with Google";
      
      // Handle specific error cases
      if (errorMessage.includes("provider is not enabled")) {
        const providerErrorMessage = "Google sign-in is not enabled. Please enable it in your Supabase Authentication providers.";
        toast.error(providerErrorMessage);
        if (onError) onError(providerErrorMessage);
      } else if (errorMessage.includes("403") || errorMessage.includes("access to this page")) {
        const accessErrorMessage = "Google authentication failed with a 403 error. Please check your Google OAuth configuration in both Google Cloud Console and Supabase.";
        toast.error(accessErrorMessage);
        if (onError) onError(accessErrorMessage);
        
        console.info("Google OAuth 403 troubleshooting steps:", [
          "1. Verify your Google client ID and secret are correctly set in Supabase",
          "2. Ensure your app's redirect URL is properly whitelisted in Google Cloud Console",
          "3. Check that the Google provider is enabled in Supabase Authentication settings"
        ]);
      } else {
        toast.error(errorMessage);
        if (onError) onError(errorMessage);
      }
    }
  };
  
  return (
    <Button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-2 border border-[#373763]/20 bg-white hover:bg-gray-50 text-[#373763] py-6 rounded-xl font-oxanium ${className}`}
    >
      {isLoading ? (
        <LightningSpinner size="sm" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_1_2)">
            <path d="M19.805 10.2303C19.805 9.55056 19.7499 8.86711 19.6323 8.19836H10.2V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.088V17.5866H16.825C18.7173 15.8449 19.805 13.2728 19.805 10.2303Z" fill="#4285F4"/>
            <path d="M10.2 20.0008C12.897 20.0008 15.1731 19.1152 16.8287 17.5866L13.6062 15.0879C12.7096 15.698 11.5522 16.0434 10.2037 16.0434C7.5948 16.0434 5.38274 14.2833 4.58902 11.9169H1.26367V14.4927C2.96127 17.8695 6.41892 20.0008 10.2 20.0008Z" fill="#34A853"/>
            <path d="M4.58565 11.9169C4.16676 10.675 4.16676 9.33008 4.58565 8.08814V5.51236H1.26395C-0.154384 8.33817 -0.154384 11.667 1.26395 14.4927L4.58565 11.9169Z" fill="#FBBC04"/>
            <path d="M10.2 3.95805C11.6257 3.936 13.0036 4.47247 14.0361 5.45722L16.8911 2.60218C15.0833 0.904587 12.6839 -0.0287217 10.2 0.000673888C6.41892 0.000673888 2.96127 2.13185 1.26367 5.51234L4.58537 8.08813C5.37544 5.71811 7.59116 3.95805 10.2 3.95805Z" fill="#EA4335"/>
          </g>
          <defs>
            <clipPath id="clip0_1_2">
              <rect width="20" height="20" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      )}
      <span>{isLoading ? "Loading..." : text}</span>
    </Button>
  );
};

export default GoogleSignInButton;
