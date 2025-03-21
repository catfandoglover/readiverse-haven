
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format, addDays, startOfToday } from "date-fns";
import { Check, ArrowRight, Calendar as CalendarIcon } from "lucide-react";

// You can replace this with environment variables or secure storage in a production app
const TIDYCAL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWU4NzkzZDRjMTZiYzM5ZWQ3NzAxNGIxMDQ0YThlNDJkOWJhY2E2OWNhZjFhYTBlOWY1N2ZiYmIwZDk3Mzc2MGFjMWViNGZlZjA2NGUzZTUiLCJpYXQiOjE3NDI1MzAyMDIuNjk0Nzk5LCJuYmYiOjE3NDI1MzAyMDIuNjk0OCwiZXhwIjo0ODk4MjAzODAyLjY4Nzg1NSwic3ViIjoiMjM3ODk0Iiwic2NvcGVzIjpbXX0.GHJxK5HXLOqAieHHpFh21AeRbO_4ZNoyPjfQ8sSQcGEgYk0OQsACvorEcgB-oUnUAKuvF69c1jthM9NAZoIklCg5t6nVcWm6YFZWNDXZ5OncjSl2zNF5EDMMvXttk2DkwzzcYFa4547FTqK-kY6V9s05hKPFFGV9Kfkdk5wmrAUyhgCH90iDUwK9cY8caryf2Y1lY-f0L2pHwCY-kfC1Csq9_OJ8-FcaC2Jn8BGtfttpMle2gylLxSCka-yVWEpwlB57YgeG7oPObl3qTUo4ZjB4y_lvqOrNRzfBSsFFUXy7tnD032umRseORfsft6WnPZ3W6bsvlxK6-PmyaBheIEO_BzLA0vZ8ZTUvdWU-q3dZ7PMOf-ZIH86bFsUHaixKcPc3b4Et2wkVQ9dNS6vXQxWDVjxuexddunbScYl-r73H0ieSBGpsic2ealds0_prkQBJGVj-K71EVM6H9bFv3BtZ16Po0ohbIi_V3QVV35lVy1kctDEbqSuQ3F1h68xINyLxDzO9n2T2MoLGtPUnes6R65cCvmTX9QufwaKNjEAwAbO6KsLvm4WqWNKIlzTUfNl1sidZ4oyzSYbtrRdKDiJddd7y_5Q1b4C9-aAwUd4eqsoisAsXJwjVkuDN6J2mvjCHFihX-lmJwAElEPfuFpwM1GdNT_pWeIPeCikgA9s";

// Mock services - in production these would be fetched from the TidyCal API
const SERVICES = [
  { id: "1", name: "DNA Assessment Discussion", duration: 30, description: "Discuss your DNA assessment results with an intellectual genetic counselor" },
  { id: "2", name: "Deep Dive Session", duration: 60, description: "An in-depth exploration of your intellectual DNA with personalized guidance" },
];

// Mock time slots - in production these would be fetched from the TidyCal API based on selected date and service
const generateMockTimeSlots = (date: Date) => {
  const dateStr = format(date, "yyyy-MM-dd");
  return [
    { id: `${dateStr}-1`, date: dateStr, start_time: "09:00", end_time: "09:30", timezone: "America/New_York" },
    { id: `${dateStr}-2`, date: dateStr, start_time: "10:00", end_time: "10:30", timezone: "America/New_York" },
    { id: `${dateStr}-3`, date: dateStr, start_time: "11:00", end_time: "11:30", timezone: "America/New_York" },
    { id: `${dateStr}-4`, date: dateStr, start_time: "13:00", end_time: "13:30", timezone: "America/New_York" },
    { id: `${dateStr}-5`, date: dateStr, start_time: "14:00", end_time: "14:30", timezone: "America/New_York" },
    { id: `${dateStr}-6`, date: dateStr, start_time: "15:00", end_time: "15:30", timezone: "America/New_York" },
  ];
};

interface TidyCalBookingProps {
  onClose?: () => void;
  onSuccess?: (bookingData: TidyCalBookingResponse) => void;
}

const TidyCalBooking: React.FC<TidyCalBookingProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'service' | 'date' | 'time' | 'details'>('service');
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TidyCalTimeSlot[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      // In a real implementation, this would be an API call to TidyCal
      setTimeSlots(generateMockTimeSlots(selectedDate));
    }
  }, [selectedDate]);

  const handleServiceSelection = (serviceId: string) => {
    setSelectedService(serviceId);
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedTimeSlot || !name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, this would be an API call to TidyCal
      // const response = await fetch('https://api.tidycal.com/v1/bookings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${TIDYCAL_API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     name,
      //     email,
      //     service_id: selectedService,
      //     time_slot_id: selectedTimeSlot,
      //     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      //   })
      // });
      
      // const data = await response.json();
      
      // Mock successful booking
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
    
    const service = SERVICES.find(s => s.id === selectedService);
    if (!service) return null;
    
    return {
      date: format(new Date(timeSlot.date), "MMMM d, yyyy"),
      time: `${timeSlot.start_time} - ${timeSlot.end_time}`,
      service: service.name,
      duration: service.duration
    };
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="font-baskerville text-2xl text-center">Book a Session</CardTitle>
        <CardDescription className="text-center">
          Schedule time with an intellectual genetic counselor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={step} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="service" disabled={step !== 'service'}>Service</TabsTrigger>
            <TabsTrigger value="date" disabled={step !== 'date' && step !== 'service'}>Date</TabsTrigger>
            <TabsTrigger value="time" disabled={step !== 'time' && step !== 'date' && step !== 'service'}>Time</TabsTrigger>
            <TabsTrigger value="details" disabled={step !== 'details' && step !== 'time' && step !== 'date' && step !== 'service'}>Details</TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="space-y-4">
            <div className="flex flex-col space-y-3">
              {SERVICES.map(service => (
                <Button 
                  key={service.id} 
                  variant="outline" 
                  className={`flex justify-between items-center p-4 h-auto ${selectedService === service.id ? 'border-[#373763] bg-[#373763]/5' : ''}`}
                  onClick={() => handleServiceSelection(service.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{service.name}</span>
                    <span className="text-sm text-gray-500">{service.duration} minutes</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="date">
            <div className="flex flex-col items-center space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelection}
                fromDate={startOfToday()}
                toDate={addDays(new Date(), 60)}
                className="rounded-md border"
              />
              <Button 
                variant="ghost" 
                onClick={() => setStep('service')}
                className="text-[#373763]"
              >
                Back to Services
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <div className="flex flex-col space-y-4">
              <div className="text-center mb-4">
                <Label className="font-semibold">Select a time on {selectedDate && format(selectedDate, "MMMM d, yyyy")}</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map(slot => (
                  <Button 
                    key={slot.id} 
                    variant="outline" 
                    className={`${selectedTimeSlot === slot.id ? 'border-[#373763] bg-[#373763]/5' : ''}`}
                    onClick={() => handleTimeSelection(slot.id)}
                  >
                    {slot.start_time}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('date')}
                  className="text-[#373763]"
                >
                  Back to Date
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <form onSubmit={handleBooking} className="space-y-4">
              {getSelectedTimeSlotDetails() && (
                <div className="bg-[#373763]/5 p-4 rounded-md mb-4">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Service:</span> {getSelectedTimeSlotDetails()?.service}</p>
                    <p><span className="font-medium">Duration:</span> {getSelectedTimeSlotDetails()?.duration} minutes</p>
                    <p><span className="font-medium">Date:</span> {getSelectedTimeSlotDetails()?.date}</p>
                    <p><span className="font-medium">Time:</span> {getSelectedTimeSlotDetails()?.time}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => setStep('time')}
                  className="text-[#373763]"
                >
                  Back to Time Selection
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#373763] text-white hover:bg-[#373763]/90"
                >
                  {isLoading ? "Processing..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      {step === 'service' && onClose && (
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={onClose} className="text-[#373763]">
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TidyCalBooking;
