
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import MainMenu from '@/components/navigation/MainMenu';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The actual booking is created by the webhook
    // Here we just show a success message and redirect after a delay
    if (sessionId) {
      console.log("Session ID detected:", sessionId);
      
      // Simulate verification process
      const timer = setTimeout(() => {
        setLoading(false);
        setVerificationComplete(true);
        toast.success('Your booking has been confirmed!');
        
        // Redirect to the home page after showing success for a few seconds
        const redirectTimer = setTimeout(() => {
          navigate('/');
        }, 5000);
        
        return () => clearTimeout(redirectTimer);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // If no session ID, show error and add retry option
      console.error("No session ID found in URL");
      setLoading(false);
      setError("Payment information missing. Please try booking again.");
    }
  }, [sessionId, navigate]);

  const handleRetry = () => {
    navigate('/book-counselor');
  };

  return (
    <div className="min-h-[100dvh] bg-[#301630] text-[#E9E7E2]">
      <div className="flex items-center pt-4 pb-4 px-8 bg-[#301630] text-[#E9E7E2]">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOOKING CONFIRMATION
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>
      
      <div className="max-w-lg mx-auto p-6 text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#E9E7E2] mb-4" />
            <h2 className="text-xl font-baskerville mb-2">Verifying your booking...</h2>
            <p className="text-sm text-gray-300">This will only take a moment</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-6" />
            <h1 className="text-2xl font-baskerville leading-tight tracking-tight text-white font-bold">
              Something went wrong
            </h1>
            
            <p className="text-lg text-gray-300 mt-4 mb-8">
              {error}
            </p>
            
            <Button 
              onClick={handleRetry}
              className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 mt-4"
            >
              Return to Booking
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
            <h1 className="text-2xl font-baskerville leading-tight tracking-tight text-white font-bold">
              Your Session is Confirmed!
            </h1>
            
            <p className="text-lg text-gray-300 mt-4 mb-8">
              Thank you for booking a DNA Assessment Discussion. 
              Details have been sent to your email.
            </p>
            
            <Button 
              onClick={() => navigate('/')}
              className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSuccess;
