
import { useState, useEffect } from 'react';

export const useTidyCalBooking = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [lastBookingData, setLastBookingData] = useState<TidyCalBookingResponse | null>(null);

  const openBookingDialog = () => {
    setShowBookingDialog(true);
  };

  const closeBookingDialog = () => {
    setShowBookingDialog(false);
  };

  // Set up event listener for booking completed events
  useEffect(() => {
    const handleBookingCompleted = (event: Event) => {
      const bookingData = (event as CustomEvent).detail as TidyCalBookingResponse;
      console.log('Booking completed event received:', bookingData);
      setLastBookingData(bookingData);
      
      // You can add additional actions here if needed
    };

    window.addEventListener('tidycal:booking-completed', handleBookingCompleted);
    
    return () => {
      window.removeEventListener('tidycal:booking-completed', handleBookingCompleted);
    };
  }, []);

  return {
    showBookingDialog,
    openBookingDialog,
    closeBookingDialog,
    lastBookingData
  };
};

export default useTidyCalBooking;
