
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, addDays, startOfToday, isSameDay, isToday, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTidyCalAPI, BookingType, TimeSlot } from '@/hooks/useTidyCalAPI';
import BookingTypesList from './BookingTypesList';

interface TidyCalBookingProps {
  onClose?: () => void;
  onSuccess?: (bookingData: any) => void;
}

const TidyCalBooking: React.FC<TidyCalBookingProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'types' | 'date' | 'time' | 'details'>('types');
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Use the custom hook
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

  // Detect user's timezone on component mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detectedTimezone);
    } catch (error) {
      console.error("Could not detect timezone:", error);
      setTimezone("America/New_York"); // Default fallback
    }
  }, []);

  // For testing: List all booking types first
  useEffect(() => {
    fetchBookingTypes();
  }, [retryAttempt]);

  // Load available dates when current month changes
  useEffect(() => {
    if (selectedBookingType && step === 'date') {
      fetchAvailableDates(currentMonth, selectedBookingType.id);
    }
  }, [currentMonth, step, selectedBookingType, retryAttempt]);

  // Load time slots when a date is selected
  useEffect(() => {
    if (selectedDate && selectedBookingType && step === 'time') {
      fetchTimeSlots(selectedDate, selectedBookingType.id);
    }
  }, [selectedDate, step, selectedBookingType, retryAttempt]);

  const handleBookingTypeSelection = (type: BookingType) => {
    setSelectedBookingType(type);
    setStep('date');
  };

  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setStep('time');
    }
  };

  const handleTimeSelection = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
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
        
        // Notify parent component
        if (onSuccess) {
          onSuccess(response);
        }
        
        // Redirect to payment page
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
      price: selectedBookingType.price,
      currency: selectedBookingType.currency || "USD"
    };
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

  // Render error state
  const renderError = (errorMessage: string | null, isLoading: boolean, retryFn: () => void) => {
    if (!errorMessage) return null;
    
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
        <Button 
          variant="outline" 
          onClick={retryFn}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Retry
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs value={step} onValueChange={(value) => setStep(value as 'types' | 'date' | 'time' | 'details')}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="types" disabled={step !== 'types'}>Types</TabsTrigger>
          <TabsTrigger value="date" disabled={step === 'types'}>Date</TabsTrigger>
          <TabsTrigger value="time" disabled={!selectedDate || step === 'types' || step === 'date'}>Time</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedTimeSlot || step === 'types' || step === 'date' || step === 'time'}>Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="types">
          <BookingTypesList onSelect={handleBookingTypeSelection} />
        </TabsContent>
        
        <TabsContent value="date">
          <div className="flex flex-col items-center">
            {selectedBookingType && (
              <div className="w-full mb-6 p-4 bg-[#373763]/5 rounded-md">
                <h3 className="font-semibold text-lg mb-2">{selectedBookingType.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{selectedBookingType.duration} minutes</span>
                </div>
                {selectedBookingType.price && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>${selectedBookingType.price} {selectedBookingType.currency}</span>
                  </div>
                )}
                {selectedBookingType.description && (
                  <p className="mt-3 text-sm">{selectedBookingType.description}</p>
                )}
              </div>
            )}
            
            <div className="mb-4 w-full flex items-center justify-between">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setStep('types')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                disabled={datesLoading}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {datesError ? (
              renderError(datesError, datesLoading, handleRetry)
            ) : datesLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#373763]" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelection}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                fromDate={startOfToday()}
                toDate={addDays(new Date(), 60)}
                classNames={{
                  day_today: "bg-muted text-muted-foreground",
                  day_selected: "bg-[#373763] text-white hover:bg-[#373763] hover:text-white",
                  cell: cn(
                    "relative p-0 focus-within:relative focus-within:z-20 [&:has(.day-outside)]:opacity-50"
                  ),
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted"
                  ),
                }}
                modifiersClassNames={{
                  selected: "bg-[#373763] text-white hover:bg-[#373763] hover:text-white",
                }}
                modifiers={{
                  available: (date) => isDateAvailable(date),
                  unavailable: (date) => !isDateAvailable(date) && !isToday(date)
                }}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-md border p-3 pointer-events-auto bg-white"
              />
            )}
            
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[#373763] mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-gray-200 mr-2"></div>
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
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="text-lg font-semibold">
                {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
            </div>
            
            {timeSlotsError ? (
              renderError(timeSlotsError, timeSlotsLoading, handleRetry)
            ) : timeSlotsLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#373763]" />
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {timeSlots.map(slot => (
                  <Button 
                    key={slot.id} 
                    variant="outline" 
                    className={cn(
                      "justify-center text-center h-12",
                      slot.available ? "hover:border-[#373763] hover:bg-[#373763]/5" : "opacity-50 cursor-not-allowed",
                      selectedTimeSlot === slot.id ? "border-[#373763] bg-[#373763]/5" : ""
                    )}
                    onClick={() => slot.available && handleTimeSelection(slot.id)}
                    disabled={!slot.available}
                  >
                    {slot.start_time}
                  </Button>
                ))}
                
                {timeSlots.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No available times for this date. Please select another date.
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">
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
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="text-lg font-semibold">Enter Details</h3>
            </div>
            
            {getSelectedTimeSlotDetails() && (
              <div className="bg-[#373763]/5 p-4 rounded-md mb-4">
                <h3 className="font-semibold mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex">
                    <CalendarIcon className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{getSelectedTimeSlotDetails()?.service}</p>
                      <p className="text-muted-foreground">{getSelectedTimeSlotDetails()?.duration} minutes</p>
                    </div>
                  </div>
                  <p><span className="font-medium">Date:</span> {getSelectedTimeSlotDetails()?.date}</p>
                  <p><span className="font-medium">Time:</span> {getSelectedTimeSlotDetails()?.time} ({timezone})</p>
                  
                  {getSelectedTimeSlotDetails()?.price && (
                    <div className="flex mt-2 pt-2 border-t">
                      <DollarSign className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Payment Required</p>
                        <p className="text-muted-foreground">
                          ${getSelectedTimeSlotDetails()?.price} {getSelectedTimeSlotDetails()?.currency}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="required">Your Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name"
                required
                className="bg-[#E9E7E2]/50 border-[#373763]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="required">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email address"
                required
                className="bg-[#E9E7E2]/50 border-[#373763]/20"
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
                className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12"
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
              
              <p className="text-center text-xs text-muted-foreground">
                After clicking, you'll be redirected to complete payment to confirm your booking.
              </p>
            </div>
          </form>
        </TabsContent>
      </Tabs>
      
      {step === 'types' && onClose && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="bg-[#E9E7E2]/50 text-[#373763] hover:bg-[#E9E7E2] hover:text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12 border border-[#373763]/20"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default TidyCalBooking;
