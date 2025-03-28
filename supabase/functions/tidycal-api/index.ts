
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Using the token provided
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
    // Parse request path and body
    const body = req.method === "POST" ? await req.json() : {};
    const path = body.path || "";

    console.log(`Processing request for path: ${path}`, body);

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
    console.log(`Fetching booking type: ${TIDYCAL_BOOKING_TYPE_ID}`);
    const url = `${TIDYCAL_BASE_URL}/booking-types/${TIDYCAL_BOOKING_TYPE_ID}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      },
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText}`);

    if (!response.ok) {
      console.error(`TidyCal API error (${response.status}):`, responseText);
      throw new Error(`TidyCal API error: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid JSON response from TidyCal API");
    }
    
    console.log("Booking type data:", data);
    
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
    if (!month) {
      throw new Error("Month parameter is required");
    }

    console.log(`Fetching available dates for month: ${month}`);
    const url = `${TIDYCAL_BASE_URL}/booking-types/${TIDYCAL_BOOKING_TYPE_ID}/available-dates?month=${month}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      },
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText}`);

    if (!response.ok) {
      console.error(`TidyCal API error (${response.status}):`, responseText);
      throw new Error(`TidyCal API error: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid JSON response from TidyCal API");
    }
    
    console.log("Available dates:", data);
    
    return new Response(JSON.stringify({ available_dates: data.dates }), {
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

    console.log(`Fetching time slots for date: ${date}`);
    const url = `${TIDYCAL_BASE_URL}/booking-types/${TIDYCAL_BOOKING_TYPE_ID}/time-slots?date=${date}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      },
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText}`);

    if (!response.ok) {
      console.error(`TidyCal API error (${response.status}):`, responseText);
      throw new Error(`TidyCal API error: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid JSON response from TidyCal API");
    }
    
    console.log("Time slots:", data);
    
    return new Response(JSON.stringify({ time_slots: data.slots }), {
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
    if (!bookingData.name || !bookingData.email || !bookingData.time_slot_id || !bookingData.timezone) {
      throw new Error("Missing required booking information");
    }

    console.log("Creating booking with data:", bookingData);
    const url = `${TIDYCAL_BASE_URL}/bookings`;
    console.log(`Making request to: ${url}`);
    
    const requestBody = JSON.stringify({
      booking_type_id: TIDYCAL_BOOKING_TYPE_ID,
      name: bookingData.name,
      email: bookingData.email,
      time_slot_id: bookingData.time_slot_id,
      timezone: bookingData.timezone,
      // Add any additional fields if needed
    });
    
    console.log("Request body:", requestBody);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      },
      body: requestBody,
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText}`);

    if (!response.ok) {
      console.error(`TidyCal API error (${response.status}):`, responseText);
      throw new Error(`TidyCal API error: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid JSON response from TidyCal API");
    }
    
    console.log("Booking response:", data);
    
    return new Response(JSON.stringify(data), {
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
