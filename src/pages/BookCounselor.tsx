import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import TidyCalBooking from '@/components/booking/TidyCalBooking';
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';
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

  // Initialize TidyCal when this component mounts
  useEffect(() => {
    const loadTidyCalScript = () => {
      console.log("Loading TidyCal script...");
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
          } else {
            console.error("TidyCal object not available after script load");
          }
        };
        document.body.appendChild(script);
      } else if (window.TidyCal) {
        try {
          window.TidyCal.init();
          console.log("TidyCal reinitialized with existing script");
        } catch (error) {
          console.error("Error reinitializing TidyCal:", error);
        }
      } else {
        console.error("TidyCal script exists but TidyCal object is not available");
      }
    };
    
    loadTidyCalScript();
    
    // Clean up function
    return () => {
      // No need to remove the script on unmount to prevent reloading issues
      console.log("BookCounselor component unmounted");
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#301630] text-[#E9E7E2]">
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOOK A COUNSELOR
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50"
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
