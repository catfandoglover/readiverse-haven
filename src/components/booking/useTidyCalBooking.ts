
import { useState, useEffect } from 'react';

export const useTidyCalBooking = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const openBookingDialog = () => {
    setShowBookingDialog(true);
  };

  const closeBookingDialog = () => {
    setShowBookingDialog(false);
  };

  // Listen for window messages from TidyCal
  useEffect(() => {
    const handleBookingCompleted = (event: Event) => {
      console.log('Booking completed event received:', (event as CustomEvent).detail);
      // Handle any additional actions here
    };
    
    // Add event listener
    window.addEventListener('tidycal:booking-completed', handleBookingCompleted);
    
    // Clean up
    return () => {
      window.removeEventListener('tidycal:booking-completed', handleBookingCompleted);
    };
  }, []);

  return {
    showBookingDialog,
    openBookingDialog,
    closeBookingDialog
  };
};

export default useTidyCalBooking;
