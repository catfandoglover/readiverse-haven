
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TidyCalBooking from './TidyCalBooking';

interface TidyCalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TidyCalDialog: React.FC<TidyCalDialogProps> = ({ open, onOpenChange }) => {
  const handleSuccess = (bookingData: TidyCalBookingResponse) => {
    console.log('Booking successful:', bookingData);
    // You might want to dispatch a custom event for integration with the parent component
    window.dispatchEvent(new CustomEvent('tidycal:booking-completed', { detail: bookingData }));
    
    // Close the dialog after a short delay to show the success message
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80%] max-w-lg bg-[#E9E7E2] p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-baskerville leading-none tracking-tight text-black font-bold pt-10">
            Book a Session
          </DialogTitle>
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
