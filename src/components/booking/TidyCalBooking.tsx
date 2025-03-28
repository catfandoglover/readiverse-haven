
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, addDays, startOfToday, isSameDay, isToday } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TIDYCAL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWU4NzkzZDRjMTZiYzM5ZWQ3NzAxNGIxMDQ0YThlNDJkOWJhY2E2OWNhZjFhYTBlOWY1N2ZiYmIwZDk3Mzc2MGFjMWViNGZlZjA2NGUzZTUiLCJpYXQiOjE3NDI1MzAyMDIuNjk0Nzk5LCJuYmYiOjE3NDI1MzAyMDIuNjk0OCwiZXhwIjo0ODk4MjAzODAyLjY4Nzg1NSwic3ViIjoiMjM3ODk0Iiwic2NvcGVzIjpbXX0.GHJxK5HXLOqAieHHpFh21AeRbO_4ZNoyPjfQ8sSQcGEgYk0OQsACvorEcgB-oUnUAKuvF69c1jthM9NAZoIklCg5t6nVcWm6YFZWNDXZ5OncjSl2zNF5EDMMvXttk2DkwzzcYFa4547FTqK-kY6V9s05hKPFFGV9Kfkdk5wmrAUyhgCH90iDUwK9cY8caryf2Y1lY-f0L2pHwCY-kfC1Csq9_OJ8-FcaC2Jn8BGtfttpMle2gylLxSCka-yVWEpwlB57YgeG7oPObl3qTUo4ZjB4y_lvqOrNRzfBSsFFUXy7tnD032umRseORfsft6WnPZ3W6bsvlxK6-PmyaBheIEO_BzLA0vZ8ZTUvdWU-q3dZ7PMOf-ZIH86bFsUHaixKcPc3b4Et2wkVQ9dNS6vXQxWDVjxuexddunbScYl-r73H0ieSBGpsic2ealds0_prkQBJGVj-K71EVM6H9bFv3BtZ16Po0ohbIi_V3QVV35lVy1kctDEbqSuQ3F1h68xINyLxDzO9n2T2MoLGtPUnes6R65cCvmTX9QufwaKNjEAwAbO6KsLvm4WqWNKIlzTUfNl1sidZ4oyzSYbtrRdKDiJddd7y_5Q1b4C9-aAwUd4eqsoisAsXJwjVkuDN6J2mvjCHFihX-lmJwAElEPfuFpwM1GdNT_pWeIPeCikgA9s";

const DEFAULT_SERVICE = {
  id: "1", 
  name: "DNA Assessment Discussion", 
  duration: 30, 
  description: "Conduct your intellectual DNA assessment and review the results with a Lightning intellectual genetic counselor. You will have the option of booking follow up appointments with your counselor if desired."
};

const generateTimeSlots = (date: Date) => {
  const dateStr = format(date, "yyyy-MM-dd");
  return [
    { id: `${dateStr}-1`, date: dateStr, start_time: "09:00", end_time: "09:30", timezone: "America/New_York", available: true },
    { id: `${dateStr}-2`, date: dateStr, start_time: "10:00", end_time: "10:30", timezone: "America/New_York", available: true },
    { id: `${dateStr}-3`, date: dateStr, start_time: "11:00", end_time: "11:30", timezone: "America/New_York", available: true },
    { id: `${dateStr}-4`, date: dateStr, start_time: "13:00", end_time: "13:30", timezone: "America/New_York", available: true },
    { id: `${dateStr}-5`, date: dateStr, start_time: "14:00", end_time: "14:30", timezone: "America/New_York", available: true },
    { id: `${dateStr}-6`, date: dateStr, start_time: "15:00", end_time: "15:30", timezone: "America/New_York", available: false },
  ];
};

const generateAvailableDates = () => {
  const today = startOfToday();
  const availableDates: Date[] = [];
  
  for (let i = 1; i <= 60; i++) {
    const date = addDays(today, i);
    if (i % 3 !== 0) {
      availableDates.push(date);
    }
  }
  
  return availableDates;
};

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
  meeting_link: string;
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
  const [timezone, setTimezone] = useState<string>("America/New_York");

  useEffect(() => {
    setAvailableDates(generateAvailableDates());
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
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
      setTimeout(() => {
        const mockBookingResponse: TidyCalBookingResponse = {
          id: `booking-${Date.now()}`,
          status: 'confirmed',
          meeting_link: 'https://meet.google.com/mock-meeting-link'
        };
        
        toast.success("Booking confirmed! Check your email for details.");
        
        if (onSuccess) {
          onSuccess(mockBookingResponse);
        }
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Error creating booking. Please try again.");
      setIsLoading(false);
    }
  };

  const getSelectedTimeSlotDetails = () => {
    const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
    if (!timeSlot) return null;
    
    return {
      date: selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "",
      time: `${timeSlot.start_time} - ${timeSlot.end_time}`,
      service: DEFAULT_SERVICE.name,
      duration: DEFAULT_SERVICE.duration
    };
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

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
            <div className="mb-4 w-full flex items-center justify-between">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
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
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
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
                {isLoading ? "Processing..." : "Schedule Meeting"}
              </Button>
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
