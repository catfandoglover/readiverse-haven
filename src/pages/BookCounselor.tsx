
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import TidyCalBooking from '@/components/booking/TidyCalBooking';
import { toast } from "sonner";
import { ArrowLeft, Menu } from 'lucide-react';
import MainMenu from '@/components/navigation/MainMenu';

const BookCounselor = () => {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    toast.success('Booking confirmed! Check your email for details.');
    setIsCompleted(true);
    
    // Navigate back after showing success message
    setTimeout(() => {
      navigate(-1);
    }, 3000);
  };

  useEffect(() => {
    // Only load and initialize TidyCal on this page
    console.log("Loading TidyCal script on BookCounselor page...");
    const existingScript = document.getElementById('tidycal-script');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js';
      script.id = 'tidycal-script';
      script.async = true;
      script.onload = () => {
        console.log("TidyCal script loaded successfully");
        if (window.TidyCal) {
          window.TidyCal.init();
          console.log("TidyCal initialized on script load");
        }
      };
      document.body.appendChild(script);
    } else {
      console.log("TidyCal script already exists, initializing...");
      // Re-initialize if script is already present
      if (window.TidyCal) {
        setTimeout(() => {
          window.TidyCal.init();
          console.log("TidyCal reinitialized with existing script");
        }, 300);
      }
    }
    
    // Clean up function - no need to remove the script as it might be needed elsewhere
    return () => {
      console.log("BookCounselor component unmounted");
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#301630] text-[#E9E7E2]">
      <div className="flex items-center pt-4 pb-4 px-8 bg-[#301630] text-[#E9E7E2]">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOOK A COUNSELOR
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#E9E7E2] hover:bg-[#E9E7E2]/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-baskerville leading-none tracking-tight text-white font-bold pt-2 pb-4">
          Book a DNA Assessment Discussion
        </h1>
        
        <p className="text-sm text-gray-300 mb-6">
          Schedule a session with one of our expert counselors to discuss your intellectual DNA results
          and get personalized guidance on your philosophical journey.
        </p>
        
        <TidyCalBooking 
          onClose={() => navigate(-1)} 
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default BookCounselor;
