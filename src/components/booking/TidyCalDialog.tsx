import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TidyCalBooking from './TidyCalBooking';

interface TidyCalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TidyCalDialog: React.FC<TidyCalDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const handleSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    // Dispatch event for integration with the parent component
    window.dispatchEvent(new CustomEvent('tidycal:booking-completed', { detail: bookingData }));
    
    // Close the dialog after a short delay to show the success message
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  // When the dialog opens, navigate to the full page instead
  React.useEffect(() => {
    if (open) {
      onOpenChange(false); // Close this dialog
      navigate('/book-counselor'); // Navigate to the full page
    }
  }, [open, navigate, onOpenChange]);

  // We still render the dialog for cases where we might want to use it directly
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-lg bg-[#E9E7E2] p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-baskerville leading-none tracking-tight text-black font-bold pt-5">
            Book a DNA Assessment Discussion
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Schedule a one-on-one discussion about your DNA Assessment results with a counselor.
          </DialogDescription>
        </DialogHeader>
        <TidyCalBooking 
          onClose={() => onOpenChange(false)} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TidyCalDialog;
