
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, addDays, startOfToday, isSameDay, isToday, parse, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock, DollarSign, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface BookingTypeResponse {
  id: string;
  name: string;
  duration: number;
  description: string;
  price?: number;
  currency?: string;
}

interface TidyCalTimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  available: boolean;
}

interface TidyCalBookingProps {
  onClose?: () => void;
  onSuccess?: (bookingData: TidyCalBookingResponse) => void;
}

interface TidyCalBookingResponse {
  id: string;
  status: string;
  meeting_link?: string;
  payment_link?: string;
  price?: number;
  currency?: string;
}

const TidyCalBooking: React.FC<TidyCalBookingProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'date' | 'time' | 'details'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TidyCalTimeSlot[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>("");
  const [bookingType, setBookingType] = useState<BookingTypeResponse | null>(null);
  const [bookingTypeLoading, setBookingTypeLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(false);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);

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

  // Fetch booking type details on mount
  useEffect(() => {
    const fetchBookingType = async () => {
      setBookingTypeLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('tidycal-api', {
          body: { path: 'booking-type' },
        });

        if (error) throw error;
        
        setBookingType(data);
      } catch (error) {
        console.error('Error fetching booking type:', error);
        toast.error("Could not load booking information");
      } finally {
        setBookingTypeLoading(false);
      }
    };

    fetchBookingType();
  }, []);

  // Load available dates when current month changes
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setDatesLoading(true);
      try {
        const monthString = format(currentMonth, "yyyy-MM");
        
        const { data, error } = await supabase.functions.invoke('tidycal-api', {
          body: { 
            path: 'available-dates',
            month: monthString
          },
        });

        if (error) throw error;
        
        if (data.available_dates) {
          // Convert date strings to Date objects
          const dates = data.available_dates.map((dateStr: string) => parseISO(dateStr));
          setAvailableDates(dates);
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
        toast.error("Could not load available dates");
      } finally {
        setDatesLoading(false);
      }
    };

    fetchAvailableDates();
  }, [currentMonth]);

  // Load time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      const fetchTimeSlots = async () => {
        setTimeSlotsLoading(true);
        try {
          const dateString = format(selectedDate, "yyyy-MM-dd");
          
          const { data, error } = await supabase.functions.invoke('tidycal-api', {
            body: { 
              path: 'time-slots',
              date: dateString
            },
          });

          if (error) throw error;
          
          if (data.time_slots) {
            setTimeSlots(data.time_slots);
          }
        } catch (error) {
          console.error('Error fetching time slots:', error);
          toast.error("Could not load available time slots");
        } finally {
          setTimeSlotsLoading(false);
        }
      };

      fetchTimeSlots();
    }
  }, [selectedDate]);

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot || !name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'create-booking',
          name,
          email,
          time_slot_id: selectedTimeSlot,
          timezone
        },
      });

      if (error) throw error;
      
      if (data.status === 'pending_payment' && data.payment_link) {
        toast.success("Booking created! Redirecting to payment page...");
        
        // Notify parent component
        if (onSuccess) {
          onSuccess(data);
        }
        
        // Redirect to payment page
        window.location.href = data.payment_link;
      } else if (data.status === 'confirmed') {
        toast.success("Booking confirmed! Check your email for details.");
        
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        toast.error("Booking could not be completed. Please try again.");
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Error creating booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTimeSlotDetails = () => {
    const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
    if (!timeSlot || !bookingType) return null;
    
    return {
      date: selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "",
      time: `${timeSlot.start_time} - ${timeSlot.end_time}`,
      service: bookingType.name,
      duration: bookingType.duration,
      price: bookingType.price,
      currency: bookingType.currency || "USD"
    };
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

  // If loading booking type, show loading state
  if (bookingTypeLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#373763]" />
        <p className="mt-4 text-sm text-muted-foreground">Loading booking information...</p>
      </div>
    );
  }

  // If booking type couldn't be loaded, show error
  if (!bookingType) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <p className="text-sm text-red-500">Could not load booking information. Please try again later.</p>
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="mt-4"
          >
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={step} onValueChange={(value) => setStep(value as 'date' | 'time' | 'details')}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="date" disabled={step !== 'date'}>Date</TabsTrigger>
          <TabsTrigger value="time" disabled={!selectedDate || step === 'date'}>Time</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedTimeSlot || step === 'date' || step === 'time'}>Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="date">
          <div className="flex flex-col items-center">
            {/* Booking information */}
            <div className="w-full mb-6 p-4 bg-[#373763]/5 rounded-md">
              <h3 className="font-semibold text-lg mb-2">{bookingType.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>{bookingType.duration} minutes</span>
              </div>
              {bookingType.price && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>${bookingType.price} {bookingType.currency}</span>
                </div>
              )}
              {bookingType.description && (
                <p className="mt-3 text-sm">{bookingType.description}</p>
              )}
            </div>
            
            <div className="mb-4 w-full flex items-center justify-between">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                disabled={datesLoading}
              >
                <ArrowLeft className="h-4 w-4" />
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
            
            {datesLoading ? (
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
            
            {timeSlotsLoading ? (
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
            
            <div className="flex flex-col space-y-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12"
              >
                {isLoading ? (
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
      
      {step === 'date' && onClose && (
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
