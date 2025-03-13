import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

const AuthRequiredDialog: React.FC<AuthRequiredDialogProps> = ({
  open,
  onOpenChange,
  onContinueAsGuest,
}) => {
  const { openLogin, openSignup } = useAuth();
  
  // Log when the component renders and when props change
  useEffect(() => {
    console.log('AuthRequiredDialog rendered with open =', open);
  }, [open]);

  const handleLogin = () => {
    console.log('Opening login dialog');
    // Don't close the dialog here - it will be closed when the user successfully logs in
    openLogin({
      authenticationCallbackUrl: window.location.href
    });
  };

  const handleSignup = () => {
    console.log('Opening signup dialog');
    // Don't close the dialog here - it will be closed when the user successfully signs up
    openSignup({
      authenticationCallbackUrl: window.location.href
    });
  };

  const handleContinueAsGuest = () => {
    console.log('Continuing as guest');
    onContinueAsGuest();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#E9E7E2] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-oxanium text-2xl text-center">Save Your Results</DialogTitle>
          <DialogDescription className="font-oxanium text-center text-[#373763]">
            Create an account or log in to save your Intellectual DNA results and access them anytime.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleSignup}
            className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
          >
            Create Account
          </Button>
          
          <Button
            onClick={handleLogin}
            className="w-full py-6 rounded-2xl border border-[#373763] bg-transparent hover:bg-[#373763]/10 text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider"
            variant="outline"
          >
            Log In
          </Button>
        </div>
        
        <DialogFooter className="flex flex-col gap-4">
          <Button
            onClick={handleContinueAsGuest}
            className="w-full font-oxanium text-[#373763]/50 hover:text-[#373763] uppercase tracking-wider text-sm font-bold"
            variant="ghost"
          >
            Continue as Guest
          </Button>
          
          {/* Debug info */}
          <div className="text-xs text-gray-500 text-center">
            Dialog is {open ? 'open' : 'closed'} (prop value)
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog; 
