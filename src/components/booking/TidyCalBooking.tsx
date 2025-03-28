import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, addDays, startOfToday, isSameDay, isToday, parseISO } from "date-fns";
import { ArrowLeft, CalendarIcon, Clock, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTidyCalAPI, BookingType, TimeSlot } from '@/hooks/useTidyCalAPI';
import BookingTypesList from './BookingTypesList';
import { useBookingCost } from '@/hooks/useBookingCost';

interface TidyCalBookingProps {
  onClose?: () => void;
  onSuccess?: (bookingData: any) => void;
}

const TidyCalBooking: React.FC<TidyCalBookingProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'date' | 'time' | 'details'>('date');
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { cost, isLoading: costLoading, error: costError } = useBookingCost();
  
  const {
    bookingTypes,
    bookingTypesLoading,
    bookingTypesError,
    fetchBookingTypes,
    bookingType,
    bookingTypeLoading,
    bookingTypeError,
    fetchBookingType,
    availableDates,
    datesLoading,
    datesError,
    fetchAvailableDates,
    timeSlots,
    timeSlotsLoading,
    timeSlotsError,
    fetchTimeSlots,
    bookingLoading,
    bookingError,
    createBooking,
    retryAttempt,
    setRetryAttempt
  } = useTidyCalAPI();

  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detectedTimezone);
    } catch (error) {
      console.error("Could not detect timezone:", error);
      setTimezone("America/New_York"); // Default fallback
    }
  }, []);

  useEffect(() => {
    const loadBookingTypes = async () => {
      await fetchBookingTypes();
    };
    
    loadBookingTypes();
  }, [retryAttempt]);

  useEffect(() => {
    if (bookingTypes && bookingTypes.length > 0 && !selectedBookingType) {
      console.log("Auto-selecting first booking type:", bookingTypes[0]);
      setSelectedBookingType(bookingTypes[0]);
    }
  }, [bookingTypes, selectedBookingType]);

  useEffect(() => {
    if (selectedBookingType && step === 'date') {
      fetchAvailableDates(currentMonth, selectedBookingType.id);
    }
  }, [currentMonth, selectedBookingType, step, retryAttempt]);

  useEffect(() => {
    if (selectedDate && selectedBookingType && step === 'time') {
      fetchTimeSlots(selectedDate, selectedBookingType.id);
    }
  }, [selectedDate, selectedBookingType, step, retryAttempt]);

  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      console.log("Selected date:", date);
      setSelectedDate(date);
      setStep('time');
    }
  };

  const handleTimeSelection = (timeSlot: TimeSlot) => {
    console.log("Selected time slot:", timeSlot);
    const timeSlotValue = timeSlot.original_starts_at || timeSlot.id;
    setSelectedTimeSlot(timeSlotValue);
    setStep('details');
  };

  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
    toast.info("Retrying connection to booking service...");
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot || !name || !email || !selectedBookingType) {
      toast.error("Please fill in all required fields");
      return;
    }

    console.log("Attempting to create booking with data:", {
      name,
      email,
      time_slot_id: selectedTimeSlot,
      timezone,
      bookingTypeId: selectedBookingType.id
    });

    const response = await createBooking({
      name,
      email,
      time_slot_id: selectedTimeSlot,
      timezone,
      bookingTypeId: selectedBookingType.id
    });
    
    if (response) {
      if (response.status === 'pending_payment' && response.payment_link) {
        toast.success("Booking created! Redirecting to payment page...");
        
        if (onSuccess) {
          onSuccess(response);
        }
        
        window.location.href = response.payment_link;
      } else if (response.status === 'confirmed') {
        toast.success("Booking confirmed! Check your email for details.");
        
        if (onSuccess) {
          onSuccess(response);
        }
      }
    }
  };

  const getSelectedTimeSlotDetails = () => {
    const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
    if (!timeSlot || !selectedBookingType) return null;
    
    return {
      date: selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "",
      time: `${timeSlot.start_time} - ${timeSlot.end_time}`,
      service: selectedBookingType.name,
      duration: selectedBookingType.duration,
      price: cost || "Loading...",
    };
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

  const renderError = (errorMessage: string | null, isLoading: boolean, retryFn: () => void) => {
    if (!errorMessage) return null;
    
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-[#E9E7E2] mb-4">{errorMessage}</p>
        <Button 
          variant="outline" 
          onClick={retryFn}
          disabled={isLoading}
          className="flex items-center gap-2 text-[#E9E7E2] border-[#E9E7E2]/30 hover:bg-[#E9E7E2]/10"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Retry
        </Button>
      </div>
    );
  };

  if (bookingTypesLoading && !selectedBookingType) {
    return (
      <div className="py-8 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E9E7E2]" />
        <span className="ml-2 text-[#E9E7E2]">Loading booking options...</span>
      </div>
    );
  }

  if (bookingTypesError && !selectedBookingType) {
    return renderError(bookingTypesError, bookingTypesLoading, handleRetry);
  }

  if (!bookingTypesLoading && (!bookingTypes || bookingTypes.length === 0)) {
    return (
      <div className="text-center py-8">
        <p className="text-[#E9E7E2] mb-4">
          No booking types are currently available.
        </p>
        <Button onClick={handleRetry} variant="outline" className="text-[#E9E7E2] border-[#E9E7E2]/30 hover:bg-[#E9E7E2]/10">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={step} onValueChange={(value) => setStep(value as 'date' | 'time' | 'details')}>
        <TabsContent value="date">
          <div className="flex flex-col items-center">
            {selectedBookingType && (
              <div className="w-full mb-6 p-4 bg-[#373763]/10 rounded-md border border-[#E9E7E2]/10">
                <div className="flex items-center text-sm text-[#E9E7E2] mb-1">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{selectedBookingType.duration} minutes</span>
                </div>
                <div className="flex items-center text-sm text-[#E9E7E2]">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{costLoading ? "Loading price..." : costError ? "Price unavailable" : cost}</span>
                </div>
              </div>
            )}
            
            {datesError ? (
              renderError(datesError, datesLoading, handleRetry)
            ) : datesLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#E9E7E2]" />
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden bg-transparent">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelection}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  fromDate={startOfToday()}
                  toDate={addDays(new Date(), 60)}
                  modifiers={{
                    available: (date) => isDateAvailable(date)
                  }}
                  modifiersStyles={{
                    available: {
                      fontWeight: 'bold'
                    }
                  }}
                  modifiersClassNames={{
                    available: "border-2 border-[#373763] text-[#E9E7E2] bg-[#373763]/20"
                  }}
                  disabled={(date) => !isDateAvailable(date)}
                  className="border-0 shadow-none bg-transparent"
                />
              </div>
            )}
            
            <div className="flex items-center justify-center gap-8 mt-6 text-sm text-[#E9E7E2]">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-[#373763]/70 border-2 border-[#373763] mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full border border-[#E9E7E2]/30 mr-2"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                onClick={() => setStep('date')}
                className="mr-2 text-[#E9E7E2] hover:text-[#E9E7E2] hover:bg-[#373763]/20"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="text-lg font-semibold text-[#E9E7E2]">
                {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
            </div>
            
            {timeSlotsError ? (
              renderError(timeSlotsError, timeSlotsLoading, handleRetry)
            ) : timeSlotsLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#E9E7E2]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.length > 0 ? (
                  timeSlots.map(slot => (
                    <Button 
                      key={slot.id} 
                      variant="outline" 
                      className={cn(
                        "flex h-12 w-full justify-center items-center rounded-full transition-colors text-[#E9E7E2] border-[#E9E7E2]/20",
                        slot.available ? "hover:border-[#373763] hover:bg-[#373763]/20" : "opacity-50 cursor-not-allowed",
                        selectedTimeSlot === (slot.original_starts_at || slot.id) ? 
                          "border-[#373763] bg-[#373763] text-[#E9E7E2] font-medium" : ""
                      )}
                      onClick={() => slot.available && handleTimeSelection(slot)}
                      disabled={!slot.available}
                    >
                      {slot.start_time}
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-6 text-[#E9E7E2] col-span-3">
                    No available times for this date. Please select another date.
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-[#E9E7E2]/70">
                <span>Timezone: {timezone}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                onClick={() => setStep('time')}
                className="mr-2 text-[#E9E7E2] hover:text-[#E9E7E2] hover:bg-[#373763]/20"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="text-lg font-semibold text-[#E9E7E2]">Enter Details</h3>
            </div>
            
            {getSelectedTimeSlotDetails() && (
              <div className="bg-[#373763]/10 p-4 rounded-md mb-4 border border-[#E9E7E2]/10">
                <h3 className="font-semibold mb-2 text-[#E9E7E2]">Booking Summary</h3>
                <div className="space-y-1 text-sm text-[#E9E7E2]">
                  <div className="flex">
                    <CalendarIcon className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{getSelectedTimeSlotDetails()?.service}</p>
                      <p className="text-[#E9E7E2]/70">{getSelectedTimeSlotDetails()?.duration} minutes</p>
                    </div>
                  </div>
                  <p><span className="font-medium">Date:</span> {getSelectedTimeSlotDetails()?.date}</p>
                  <p><span className="font-medium">Time:</span> {getSelectedTimeSlotDetails()?.time} ({timezone})</p>
                  
                  <div className="flex mt-2 pt-2 border-t border-[#E9E7E2]/20">
                    <DollarSign className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Payment Required</p>
                      <p className="text-[#E9E7E2]/70">
                        {getSelectedTimeSlotDetails()?.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="required text-[#E9E7E2]">Your Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name"
                required
                className="bg-transparent border-[#E9E7E2]/20 text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 focus:border-[#E9E7E2]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="required text-[#E9E7E2]">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email address"
                required
                className="bg-transparent border-[#E9E7E2]/20 text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 focus:border-[#E9E7E2]"
              />
            </div>
            
            {bookingError && (
              <div className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {bookingError}
              </div>
            )}
            
            <div className="flex flex-col space-y-4 pt-4">
              <Button 
                type="submit" 
                disabled={bookingLoading}
                className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm font-bold uppercase tracking-wider rounded-full h-12"
              >
                {bookingLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>Schedule & Proceed to Payment</>
                )}
              </Button>
              
              <p className="text-center text-xs text-[#E9E7E2]/70">
                After clicking, you'll be redirected to complete payment to confirm your booking.
              </p>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TidyCalBooking;
