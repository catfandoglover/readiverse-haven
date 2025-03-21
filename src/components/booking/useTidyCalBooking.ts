
import { useState } from 'react';

export const useTidyCalBooking = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const openBookingDialog = () => {
    setShowBookingDialog(true);
  };

  const closeBookingDialog = () => {
    setShowBookingDialog(false);
  };

  // Listen for window messages in a real implementation
  const handleBookingCompletedEvents = () => {
    window.addEventListener('tidycal:booking-completed', (event) => {
      console.log('Booking completed event received:', (event as CustomEvent).detail);
      // Handle any additional actions here
    });
  };

  return {
    showBookingDialog,
    openBookingDialog,
    closeBookingDialog,
    handleBookingCompletedEvents
  };
};

export default useTidyCalBooking;
