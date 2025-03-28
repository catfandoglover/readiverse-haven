
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import MainMenu from "@/components/navigation/MainMenu";
import TidyCalBooking from '@/components/booking/TidyCalBooking';
import { toast } from "sonner";

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
    <div className="min-h-[100dvh] bg-[#373763] text-[#E9E7E2]">
      <div className="flex items-center pt-4 pb-4 px-8 bg-[#373763] text-[#E9E7E2]">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOOK A COUNSELOR
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>
      
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-[#E9E7E2] rounded-2xl p-6">
          <TidyCalBooking 
            onClose={() => navigate(-1)} 
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default BookCounselor;
