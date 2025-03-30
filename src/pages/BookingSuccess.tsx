
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import MainMenu from '@/components/navigation/MainMenu';
import { supabase } from "@/integrations/supabase/client";

interface BookingVerificationResponse {
  found: boolean;
  status: string;
  tidycal_booking_id?: string | null;
  error?: string;
}

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const verifyBooking = async () => {
      if (!sessionId) {
        console.error("No session ID found in URL");
        setLoading(false);
        setError("Payment information missing. Please try booking again.");
        return;
      }
      
      console.log("Verifying booking with session ID:", sessionId);
      
      try {
        // Check if a booking record exists with this session ID
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();
          
        if (bookingsError) {
          console.error("Error fetching booking:", bookingsError);
          throw new Error("Unable to verify booking status. Please contact support.");
        }
        
        if (!bookings) {
          console.error("No booking found with session ID:", sessionId);
          throw new Error("Booking not found. The payment may have been processed but the booking wasn't created.");
        }
        
        setBookingDetails(bookings);
        
        if (bookings.status === 'pending') {
          console.log("Booking is still pending, waiting for webhook processing...");
          
          // Wait a bit and check again
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const { data: updatedBooking, error: refreshError } = await supabase
            .from('bookings')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();
            
          if (!refreshError && updatedBooking && updatedBooking.status === 'completed') {
            console.log("Booking is now confirmed!");
            setBookingDetails(updatedBooking);
          } else {
            console.warn("Booking still pending after waiting, proceeding anyway");
          }
        }
        
        // Book directly if not already completed
        if (bookings.status !== 'completed' && bookings.tidycal_booking_id === null) {
          console.log("Booking not completed, attempting to create it now");
          
          const { data: createResponse, error: createError } = await supabase.functions.invoke('tidycal-api', {
            body: { 
              path: 'create-booking',
              name: bookings.name,
              email: bookings.email,
              time_slot_id: bookings.time_slot_id,
              timezone: bookings.timezone,
              bookingTypeId: bookings.booking_type_id
            }
          });
          
          if (createError) {
            console.error("Error creating booking directly:", createError);
          } else if (createResponse) {
            console.log("Booking created directly:", createResponse);
            
            // Update the booking record
            await supabase
              .from('bookings')
              .update({
                status: 'completed',
                tidycal_booking_id: createResponse.id || null
              })
              .eq('stripe_session_id', sessionId);
              
            setBookingDetails({
              ...bookings,
              status: 'completed',
              tidycal_booking_id: createResponse.id || null
            });
          }
        }
        
        setLoading(false);
        setVerificationComplete(true);
        toast.success('Your booking has been confirmed!');
        
        // Redirect to the home page after showing success for a few seconds
        const redirectTimer = setTimeout(() => {
          navigate('/');
        }, 10000);
        
        return () => clearTimeout(redirectTimer);
        
      } catch (err: any) {
        console.error("Error verifying booking:", err);
        setLoading(false);
        setError(err.message || "An error occurred while verifying your booking.");
      }
    };
    
    verifyBooking();
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
            
            <p className="text-sm text-gray-400 mt-8">
              You will be redirected to the home page automatically in 10 seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSuccess;
