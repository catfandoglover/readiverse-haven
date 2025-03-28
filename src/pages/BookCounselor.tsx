
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import TidyCalBooking from '@/components/booking/TidyCalBooking';
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';

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

  return (
    <div className="min-h-[100dvh] bg-[#301630] text-[#E9E7E2]">
      <div className="flex items-center pt-4 pb-4 px-8 bg-[#301630] text-[#E9E7E2]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="p-0 h-auto w-auto hover:bg-transparent"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOOK A COUNSELOR
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
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
