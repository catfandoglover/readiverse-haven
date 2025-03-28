
import React, { useEffect, useRef } from 'react';

// Define the props for the TidyCalBooking component
interface TidyCalBookingProps {
  onClose?: () => void;
  onSuccess?: (bookingData: any) => void;
}

const TidyCalBooking: React.FC<TidyCalBookingProps> = ({ onClose, onSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load TidyCal script
    const script = document.createElement('script');
    script.src = 'https://tidycal.com/js/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize TidyCal when script is loaded
    script.onload = () => {
      if (window.TidyCal) {
        window.TidyCal.init();
      }
    };

    // Set up booking success event listener
    const handleBookingSuccess = (event: any) => {
      console.log('TidyCal booking successful:', event.detail);
      if (onSuccess) {
        onSuccess(event.detail);
      }
    };

    window.addEventListener('tidycal:booking-completed', handleBookingSuccess);

    // Cleanup
    return () => {
      window.removeEventListener('tidycal:booking-completed', handleBookingSuccess);
      document.body.removeChild(script);
    };
  }, [onSuccess]);

  return (
    <div ref={containerRef} className="w-full h-[800px] overflow-visible" style={{ pointerEvents: 'auto' }}>
      <tidycal-embed 
        data-path="readiverse/dna-assessment-discussion"
        style={{ 
          width: '100%', 
          height: '100%',
          border: 'none',
          overflow: 'visible',
          display: 'block'
        }}
      ></tidycal-embed>
    </div>
  );
};

export default TidyCalBooking;
