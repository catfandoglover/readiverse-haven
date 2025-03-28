
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
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [bookingTypeLoading, setBookingTypeLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch booking type details
  const fetchBookingType = async () => {
    setBookingTypeLoading(true);
    try {
      console.log("Fetching booking type");
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { path: 'booking-type' },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Booking type response:", data);
      setBookingType(data);
      return data;
    } catch (error) {
      console.error('Error fetching booking type:', error);
      toast.error("Could not load booking information. Please try again later.");
      return null;
    } finally {
      setBookingTypeLoading(false);
    }
  };

  // Fetch available dates for a month
  const fetchAvailableDates = async (month: Date) => {
    setDatesLoading(true);
    try {
      const monthString = format(month, "yyyy-MM");
      console.log("Fetching available dates for month:", monthString);
      
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'available-dates',
          month: monthString
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Available dates response:", data);
      if (data.available_dates) {
        // Convert date strings to Date objects
        const dates = data.available_dates.map((dateStr: string) => parseISO(dateStr));
        setAvailableDates(dates);
        return dates;
      }
      return [];
    } catch (error) {
      console.error('Error fetching available dates:', error);
      toast.error("Could not load available dates. Please try again later.");
      return [];
    } finally {
      setDatesLoading(false);
    }
  };

  // Fetch time slots for a specific date
  const fetchTimeSlots = async (date: Date) => {
    setTimeSlotsLoading(true);
    try {
      const dateString = format(date, "yyyy-MM-dd");
      console.log("Fetching time slots for date:", dateString);
      
      const { data, error } = await supabase.functions.invoke('tidycal-api', {
        body: { 
          path: 'time-slots',
          date: dateString
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("Time slots response:", data);
      if (data.time_slots) {
        setTimeSlots(data.time_slots);
        return data.time_slots;
      }
      return [];
    } catch (error) {
      console.error('Error fetching time slots:', error);
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
  }): Promise<BookingResponse | null> => {
    setBookingLoading(true);
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
        throw error;
      }
      
      console.log("Booking response:", data);
      return data;
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Error creating booking. Please try again later.");
      return null;
    } finally {
      setBookingLoading(false);
    }
  };

  return {
    bookingType,
    bookingTypeLoading,
    fetchBookingType,
    availableDates,
    datesLoading,
    fetchAvailableDates,
    timeSlots,
    timeSlotsLoading,
    fetchTimeSlots,
    bookingLoading,
    createBooking
  };
}
