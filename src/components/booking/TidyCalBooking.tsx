
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, addDays, startOfToday, parse } from "date-fns";
import { ArrowRight, X, Loader2 } from "lucide-react";

// You can replace this with environment variables or secure storage in a production app
const TIDYCAL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWU4NzkzZDRjMTZiYzM5ZWQ3NzAxNGIxMDQ0YThlNDJkOWJhY2E2OWNhZjFhYTBlOWY1N2ZiYmIwZDk3Mzc2MGFjMWViNGZlZjA2NGUzZTUiLCJpYXQiOjE3NDI1MzAyMDIuNjk0Nzk5LCJuYmYiOjE3NDI1MzAyMDIuNjk0OCwiZXhwIjo0ODk4MjAzODAyLjY4Nzg1NSwic3ViIjoiMjM3ODk0Iiwic2NvcGVzIjpbXX0.GHJxK5HXLOqAieHHpFh21AeRbO_4ZNoyPjfQ8sSQcGEgYk0OQsACvorEcgB-oUnUAKuvF69c1jthM9NAZoIklCg5t6nVcWm6YFZWNDXZ5OncjSl2zNF5EDMMvXttk2DkwzzcYFa4547FTqK-kY6V9s05hKPFFGV9Kfkdk5wmrAUyhgCH90iDUwK9cY8caryf2Y1lY-f0L2pHwCY-kfC1Csq9_OJ8-FcaC2Jn8BGtfttpMle2gylLxSCka-yVWEpwlB57YgeG7oPObl3qTUo4ZjB4y_lvqOrNRzfBSsFFUXy7tnD032umRseORfsft6WnPZ3W6bsvlxK6-PmyaBheIEO_BzLA0vZ8ZTUvdWU-q3dZ7PMOf-ZIH86bFsUHaixKcPc3b4Et2wkVQ9dNS6vXQxWDVjxuexddunbScYl-r73H0ieSBGpsic2ealds0_prkQBJGVj-K71EVM6H9bFv3BtZ16Po0ohbIi_V3QVV35lVy1kctDEbqSuQ3F1h68xINyLxDzO9n2T2MoLGtPUnes6R65cCvmTX9QufwaKNjEAwAbO6KsLvm4WqWNKIlzTUfNl1sidZ4oyzSYbtrRdKDiJddd7y_5Q1b4C9-aAwUd4eqsoisAsXJwjVkuDN6J2mvjCHFihX-lmJwAElEPfuFpwM1GdNT_pWeIPeCikgA9s";

// Mock services - in production these would be fetched from the TidyCal API
const SERVICES = [
  { id: "1", name: "DNA Assessment Discussion", duration: 30, description: "Discuss your DNA assessment results with an intellectual genetic counselor" },
  { id: "2", name: "Deep Dive Session", duration: 60, description: "An in-depth exploration of your intellectual DNA with personalized guidance" },
];

// Function to fetch available time slots from TidyCal API
const fetchTimeSlots = async (date: Date, serviceId: string): Promise<TidyCalTimeSlot[]> => {
  // In a real implementation, this would be an API call to TidyCal
  // For now, simulate API call with mock data
  
  const dateStr = format(date, "yyyy-MM-dd");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate some time slots as mock data
  // In real implementation, this would come from the TidyCal API based on actual availability
  const mockSlots = [
    { id: `${dateStr}-1`, date: dateStr, start_time: "09:00", end_time: "09:30", timezone: "America/New_York" },
    { id: `${dateStr}-2`, date: dateStr, start_time: "10:00", end_time: "10:30", timezone: "America/New_York" },
    { id: `${dateStr}-3`, date: dateStr, start_time: "11:00", end_time: "11:30", timezone: "America/New_York" },
  ];
  
  // If service is Deep Dive, add afternoon slots
  if (serviceId === "2") {
    mockSlots.push(
      { id: `${dateStr}-4`, date: dateStr, start_time: "13:00", end_time: "14:00", timezone: "America/New_York" },
      { id: `${dateStr}-5`, date: dateStr, start_time: "14:00", end_time: "15:00", timezone: "America/New_York" }
    );
  }
  
  return mockSlots;
};

// Function to actually book the appointment with TidyCal
const bookAppointment = async (bookingData: TidyCalBookingData): Promise<TidyCalBookingResponse> => {
  // In a real implementation, this would be an API call to TidyCal
  // For now, simulate API call with mock response
  
  console.log('Sending booking data to TidyCal:', bookingData);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate successful booking
  return {
    id: `booking-${Date.now()}`,
    status: 'confirmed',
    meeting_link: 'https://meet.google.com/mock-meeting-link'
  };
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
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Update time slots when date or service changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      setIsLoadingTimeSlots(true);
      fetchTimeSlots(selectedDate, selectedService)
        .then(slots => {
          setTimeSlots(slots);
          setIsLoadingTimeSlots(false);
        })
        .catch(error => {
          console.error('Error fetching time slots:', error);
          toast.error("Unable to load available time slots");
          setIsLoadingTimeSlots(false);
          setTimeSlots([]);
        });
    }
  }, [selectedDate, selectedService]);

  const handleServiceSelection = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep('date');
  };

  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(""); // Reset time slot selection
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
      // Get the selected time slot
      const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
      if (!timeSlot) {
        throw new Error('Selected time slot not found');
      }

      // Prepare booking data
      const bookingData: TidyCalBookingData = {
        name: name,
        email: email,
        service_id: selectedService,
        time_slot_id: selectedTimeSlot,
        timezone: timeSlot.timezone,
      };

      // Send booking request
      const response = await bookAppointment(bookingData);
      
      toast.success("Booking confirmed! Check your email for details.");
      
      if (onSuccess) {
        onSuccess(response);
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

  // Format time from 24h to 12h format
  const formatTime = (time24h: string) => {
    try {
      const timeDate = parse(time24h, 'HH:mm', new Date());
      return format(timeDate, 'h:mm a');
    } catch (e) {
      return time24h; // fallback to original format if parsing fails
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <Tabs value={step} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 bg-muted/50 p-1 rounded-md">
          <TabsTrigger value="service" disabled={step !== 'service'} 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Service
          </TabsTrigger>
          <TabsTrigger value="date" disabled={step !== 'date' && step !== 'service'} 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Date
          </TabsTrigger>
          <TabsTrigger value="time" disabled={step !== 'time' && step !== 'date' && step !== 'service'} 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Time
          </TabsTrigger>
          <TabsTrigger value="details" disabled={step !== 'details' && step !== 'time' && step !== 'date' && step !== 'service'} 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service" className="space-y-4">
          <div className="flex flex-col space-y-3">
            {SERVICES.map(service => (
              <Button 
                key={service.id} 
                variant="outline" 
                className={`flex justify-between items-center p-4 h-auto text-left ${selectedService === service.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleServiceSelection(service.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-sm text-muted-foreground">{service.duration} minutes</span>
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
              className="rounded-md border shadow-sm"
            />
            <Button 
              variant="ghost" 
              onClick={() => setStep('service')}
              className="text-primary"
            >
              Back to Services
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="flex flex-col space-y-4">
            <div className="text-center mb-2">
              <Label className="font-medium">Select a time on {selectedDate && format(selectedDate, "MMMM d, yyyy")}</Label>
            </div>
            
            {isLoadingTimeSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map(slot => (
                  <Button 
                    key={slot.id} 
                    variant="outline" 
                    className={`${selectedTimeSlot === slot.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleTimeSelection(slot.id)}
                  >
                    {formatTime(slot.start_time)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No available time slots for this date. Please select another date.
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setStep('date')}
                className="text-primary"
              >
                Back to Date
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <form onSubmit={handleBooking} className="space-y-4">
            {getSelectedTimeSlotDetails() && (
              <div className="bg-muted/30 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Booking Summary</h3>
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
                className="bg-background border-input"
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
                className="bg-background border-input"
              />
            </div>
            
            <div className="flex flex-col space-y-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Confirm Booking"}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setStep('time')}
                className="border-border"
              >
                Back to Time Selection
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
      
      {step === 'service' && onClose && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-border"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default TidyCalBooking;
