
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const TIDYCAL_API_KEY = Deno.env.get("TIDYCAL_API_KEY") || "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWU4NzkzZDRjMTZiYzM5ZWQ3NzAxNGIxMDQ0YThlNDJkOWJhY2E2OWNhZjFhYTBlOWY1N2ZiYmIwZDk3Mzc2MGFjMWViNGZlZjA2NGUzZTUiLCJpYXQiOjE3NDI1MzAyMDIuNjk0Nzk5LCJuYmYiOjE3NDI1MzAyMDIuNjk0OCwiZXhwIjo0ODk4MjAzODAyLjY4Nzg1NSwic3ViIjoiMjM3ODk0Iiwic2NvcGVzIjpbXX0.GHJxK5HXLOqAieHHpFh21AeRbO_4ZNoyPjfQ8sSQcGEgYk0OQsACvorEcgB-oUnUAKuvF69c1jthM9NAZoIklCg5t6nVcWm6YFZWNDXZ5OncjSl2zNF5EDMMvXttk2DkwzzcYFa4547FTqK-kY6V9s05hKPFFGV9Kfkdk5wmrAUyhgCH90iDUwK9cY8caryf2Y1lY-f0L2pHwCY-kfC1Csq9_OJ8-FcaC2Jn8BGtfttpMle2gylLxSCka-yVWEpwlB57YgeG7oPObl3qTUo4ZjB4y_lvqOrNRzfBSsFFUXy7tnD032umRseORfsft6WnPZ3W6bsvlxK6-PmyaBheIEO_BzLA0vZ8ZTUvdWU-q3dZ7PMOf-ZIH86bFsUHaixKcPc3b4Et2wkVQ9dNS6vXQxWDVjxuexddunbScYl-r73H0ieSBGpsic2ealds0_prkQBJGVj-K71EVM6H9bFv3BtZ16Po0ohbIi_V3QVV35lVy1kctDEbqSuQ3F1h68xINyLxDzO9n2T2MoLGtPUnes6R65cCvmTX9QufwaKNjEAwAbO6KsLvm4WqWNKIlzTUfNl1sidZ4oyzSYbtrRdKDiJddd7y_5Q1b4C9-aAwUd4eqsoisAsXJwjVkuDN6J2mvjCHFihX-lmJwAElEPfuFpwM1GdNT_pWeIPeCikgA9s";
const TIDYCAL_BOOKING_TYPE_ID = "team/intellectual-genetic-counselors/intake";
const TIDYCAL_BASE_URL = "https://api.tidycal.com/v1";

// Handle CORS preflight requests
serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Get request body if present
    let body = {};
    if (req.method === "POST") {
      body = await req.json();
    }

    // Handle each endpoint
    switch (path) {
      case "booking-type":
        return await getBookingType();
      case "available-dates":
        return await getAvailableDates(body.month);
      case "time-slots":
        return await getTimeSlots(body.date);
      case "create-booking":
        return await createBooking(body);
      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Get booking type details
async function getBookingType() {
  try {
    const response = await fetch(`${TIDYCAL_BASE_URL}/booking-types/${TIDYCAL_BOOKING_TYPE_ID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`TidyCal API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching booking type:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Get available dates for a month
async function getAvailableDates(month) {
  try {
    // For now, create mock available dates (this would be replaced with actual API call)
    const today = new Date();
    const year = month ? new Date(month).getFullYear() : today.getFullYear();
    const monthIndex = month ? new Date(month).getMonth() : today.getMonth();
    
    const availableDates = [];
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Make every other day available
      if (day % 2 === 0) {
        availableDates.push(`${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
      }
    }
    
    return new Response(JSON.stringify({ available_dates: availableDates }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Get time slots for a specific date
async function getTimeSlots(date) {
  try {
    if (!date) {
      throw new Error("Date is required");
    }

    // Generate mock time slots (would be replaced with actual API call)
    const timeSlots = [
      { id: `${date}-1`, date, start_time: "09:00", end_time: "09:30", timezone: "America/New_York", available: true },
      { id: `${date}-2`, date, start_time: "10:00", end_time: "10:30", timezone: "America/New_York", available: true },
      { id: `${date}-3`, date, start_time: "11:00", end_time: "11:30", timezone: "America/New_York", available: true },
      { id: `${date}-4`, date, start_time: "13:00", end_time: "13:30", timezone: "America/New_York", available: true },
      { id: `${date}-5`, date, start_time: "14:00", end_time: "14:30", timezone: "America/New_York", available: true },
      { id: `${date}-6`, date, start_time: "15:00", end_time: "15:30", timezone: "America/New_York", available: false },
    ];
    
    return new Response(JSON.stringify({ time_slots: timeSlots }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Create a booking
async function createBooking(bookingData) {
  try {
    if (!bookingData.name || !bookingData.email || !bookingData.time_slot_id) {
      throw new Error("Missing required booking information");
    }

    // This would be replaced with an actual API call to TidyCal to create the booking
    const bookingResponse = {
      id: `booking-${Date.now()}`,
      status: 'pending_payment',
      meeting_link: null,
      payment_link: `https://tidycal.com/payment/${bookingData.time_slot_id}?email=${encodeURIComponent(bookingData.email)}&name=${encodeURIComponent(bookingData.name)}`,
      price: 150.00,
      currency: "USD"
    };
    
    return new Response(JSON.stringify(bookingResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
