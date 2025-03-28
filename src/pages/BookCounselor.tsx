
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TidyCalBooking from '@/components/booking/TidyCalBooking';
import { toast } from "sonner";

const BookCounselor = () => {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleSuccess = (bookingData: TidyCalBookingResponse) => {
    console.log('Booking successful:', bookingData);
    toast.success('Booking confirmed! Check your email for details.');
    setIsCompleted(true);
    
    // Navigate back after showing success message
    setTimeout(() => {
      navigate(-1);
    }, 3000);
  };
  
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[100dvh] bg-[#373763] text-[#E9E7E2]">
      <header className="sticky top-0 px-6 py-4 flex items-center justify-between z-50 bg-[#373763]">
        <Button 
          variant="ghost" 
          onClick={goBack}
          className="text-[#E9E7E2] hover:bg-[#373763]/50 hover:text-[#E9E7E2]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          BACK
        </Button>
        <div className="text-lg font-oxanium text-[#E9E7E2] uppercase tracking-wider font-bold">
          BOOK A COUNSELOR
        </div>
        <div className="w-10"></div> {/* Empty div for flex spacing */}
      </header>
      
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-[#E9E7E2] rounded-2xl p-6">
          <TidyCalBooking 
            onClose={goBack} 
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default BookCounselor;
