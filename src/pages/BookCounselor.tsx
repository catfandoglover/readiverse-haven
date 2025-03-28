
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import TidyCalEmbed from '@/components/booking/TidyCalEmbed';

const BookCounselor = () => {
  const navigate = useNavigate();
  
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
      
      <div className="max-w-4xl mx-auto p-4 pb-16">
        <div className="bg-[#E9E7E2] rounded-2xl p-6 mb-4">
          <h1 className="text-2xl font-baskerville leading-none tracking-tight text-black font-bold pt-2 pb-4">
            Book a DNA Assessment Discussion
          </h1>
          
          <p className="text-sm text-gray-600 mb-6">
            Schedule a session with one of our expert counselors to discuss your intellectual DNA results
            and get personalized guidance on your philosophical journey.
          </p>
          
          {/* Increased height for more visibility, removed any potential interaction blockers */}
          <div className="w-full" style={{ height: '700px' }}>
            <TidyCalEmbed 
              bookingPath="team/intellectual-genetic-counselors/intake" 
              height="700px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCounselor;
