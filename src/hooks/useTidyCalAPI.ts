
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export interface BookingType {
  id: string;
  name: string;
  duration: number;
  description: string;
  price?: number;
  currency?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  available: boolean;
}

export interface BookingResponse {
  id: string;
  status: string;
  meeting_link?: string;
  payment_link?: string;
  price?: number;
  currency?: string;
}

export function useTidyCalAPI() {
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [bookingTypesLoading, setBookingTypesLoading] = useState(false);
  const [bookingTypesError, setBookingTypesError] = useState<string | null>(null);
  
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [bookingTypeLoading, setBookingTypeLoading] = useState(true);
  const [bookingTypeError, setBookingTypeError] = useState<string | null>(null);
  
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null);
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [healthCheck, setHealthCheck] = useState<boolean | null>(null);
  const [apiData, setApiData] = useState<any | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Perform a health check when the component mounts or retry is attempted
  useEffect(() => {
    const checkHealth = async () => {
      try {
        console.log("Performing TidyCal API health check");
        setHealthCheck(null); // Reset to loading state
        setConnectionError(null);
        
        const { data, error } = await supabase.functions.invoke('tidycal-api', {
          body: { path: 'health-check' },
        });

        if (error) {
          console.error("Health check Supabase function error:", error);
          setHealthCheck(false);
          setConnectionError(`Supabase function error: ${error.message}`);
          return;
        }
        
        console.log("Health check response:", data);
        
        if (data && data.status === 'ok') {
          setHealthCheck(true);
          setApiData(data.api_data);
          
          // Automatically fetch booking types if health check passes
          await fetchBookingTypes();
        } else {
          console.error("API connection failed:", data?.message || "Unknown error");
          setHealthCheck(false);
          setConnectionError(data?.error || "Unknown connection error");
        }
      } catch (error) {
        console.error('Health check error:', error);
        setHealthCheck(false);
        setConnectionError(`Health check exception: ${error.message}`);
      }
    };
    
    checkHealth();
  }, [retryAttempt]);

  // Fetch all booking types
  const fetchBookingTypes = async () => {
    setBookingTypesLoading(true);
    setBookingTypesError(null);
    try {
      console.log("Fetching all booking types");
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { path: 'list-booking-types' },
      });

      if (error) {
        console.error("Supabase function error:", error);
        setBookingTypesError("Failed to connect to booking service. Please try again later.");
        throw error;
      }
      
      console.log("All booking types response:", data);
      if (data && data.data) {
        setBookingTypes(data.data);
        return data.data;
      } else {
        console.error("Invalid response format:", data);
        setBookingTypesError("Received invalid data format from booking service");
        return [];
      }
    } catch (error) {
      console.error('Error fetching booking types:', error);
      setBookingTypesError("Could not load booking types. Please try again later.");
      toast.error("Could not load booking types. Please try again later.");
      return [];
    } finally {
      setBookingTypesLoading(false);
    }
  };

  // Fetch booking type details
  const fetchBookingType = async (bookingTypeId: string) => {
    setBookingTypeLoading(true);
    setBookingTypeError(null);
    try {
      console.log("Fetching booking type", bookingTypeId);
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'booking-type',
          bookingTypeId
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        setBookingTypeError("Failed to connect to booking service. Please try again later.");
        throw error;
      }
      
      console.log("Booking type response:", data);
      setBookingType(data);
      return data;
    } catch (error) {
      console.error('Error fetching booking type:', error);
      setBookingTypeError("Could not load booking information. Please try again later.");
      toast.error("Could not load booking information. Please try again later.");
      return null;
    } finally {
      setBookingTypeLoading(false);
    }
  };

  // Fetch available dates for a month
  const fetchAvailableDates = async (month: Date, bookingTypeId: string) => {
    setDatesLoading(true);
    setDatesError(null);
    try {
      const monthString = format(month, "yyyy-MM");
      console.log("Fetching available dates for month:", monthString, "and booking type:", bookingTypeId);
      
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'available-dates',
          month: monthString,
          bookingTypeId
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        setDatesError("Failed to fetch available dates. Please try again later.");
        throw error;
      }
      
      console.log("Available dates response:", data);
      if (data && Array.isArray(data.available_dates)) {
        // Convert date strings to Date objects
        const dates = data.available_dates.map((dateStr: string) => parseISO(dateStr));
        setAvailableDates(dates);
        return dates;
      } else {
        console.error("Invalid dates response format:", data);
        setDatesError("Received invalid data format for available dates");
        return [];
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
      setDatesError("Could not load available dates. Please try again later.");
      toast.error("Could not load available dates. Please try again later.");
      return [];
    } finally {
      setDatesLoading(false);
    }
  };

  // Fetch time slots for a specific date
  const fetchTimeSlots = async (date: Date, bookingTypeId: string) => {
    setTimeSlotsLoading(true);
    setTimeSlotsError(null);
    try {
      const dateString = format(date, "yyyy-MM-dd");
      console.log("Fetching time slots for date:", dateString, "and booking type:", bookingTypeId);
      
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'time-slots',
          date: dateString,
          bookingTypeId
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        setTimeSlotsError("Failed to fetch time slots. Please try again later.");
        throw error;
      }
      
      console.log("Time slots response:", data);
      if (data && Array.isArray(data.time_slots)) {
        setTimeSlots(data.time_slots);
        return data.time_slots;
      } else {
        console.error("Invalid time slots response format:", data);
        setTimeSlotsError("Received invalid data format for time slots");
        return [];
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlotsError("Could not load available time slots. Please try again later.");
      toast.error("Could not load available time slots. Please try again later.");
      return [];
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  // Create a booking
  const createBooking = async (bookingData: {
    name: string;
    email: string;
    time_slot_id: string;
    timezone: string;
    bookingTypeId: string;
  }): Promise<BookingResponse | null> => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      console.log("Creating booking with data:", bookingData);
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'create-booking',
          ...bookingData
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        setBookingError("Failed to create booking. Please try again later.");
        throw error;
      }
      
      console.log("Booking response:", data);
      return data;
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError("Error creating booking. Please try again later.");
      toast.error("Error creating booking. Please try again later.");
      return null;
    } finally {
      setBookingLoading(false);
    }
  };

  return {
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
    setRetryAttempt,
    healthCheck,
    apiData,
    connectionError
  };
}
