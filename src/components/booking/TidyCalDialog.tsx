
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TidyCalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TidyCalDialog: React.FC<TidyCalDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  // When the dialog opens, navigate to the full page instead
  React.useEffect(() => {
    if (open) {
      onOpenChange(false); // Close this dialog
      navigate('/book-counselor'); // Navigate to the full page
    }
  }, [open, navigate, onOpenChange]);

  // We don't render the actual TidyCalBooking component in the dialog anymore,
  // as we redirect to the full page immediately
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-lg bg-[#E9E7E2] p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-baskerville leading-none tracking-tight text-black font-bold pt-5">
            Book a DNA Assessment Discussion
          </DialogTitle>
        </DialogHeader>
        <div className="py-8 flex justify-center items-center">
          <p>Redirecting to booking page...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TidyCalDialog;
