
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="w-[95%] max-w-md mx-auto bg-background p-6 rounded-lg border border-border shadow-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-baskerville font-semibold text-foreground">
            Book a Session
          </DialogTitle>
          <DialogDescription className="text-sm font-oxanium text-muted-foreground">
            Schedule time with an intellectual genetic counselor
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
