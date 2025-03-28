
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// TidyCal API token and configuration
const TIDYCAL_API_KEY = Deno.env.get("TIDYCAL_API_KEY") || "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWU4NzkzZDRjMTZiYzM5ZWQ3NzAxNGIxMDQ0YThlNDJkOWJhY2E2OWNhZjFhYTBlOWY1N2ZiYmIwZDk3Mzc2MGFjMWViNGZlZjA2NGUzZTUiLCJpYXQiOjE3NDI1MzAyMDIuNjk0Nzk5LCJuYmYiOjE3NDI1MzAyMDIuNjk0OCwiZXhwIjo0ODk4MjAzODAyLjY4Nzg1NSwic3ViIjoiMjM3ODk0Iiwic2NvcGVzIjpbXX0.GHJxK5HXLOqAieHHpFh21AeRbO_4ZNoyPjfQ8sSQcGEgYk0OQsACvorEcgB-oUnUAKuvF69c1jthM9NAZoIklCg5t6nVcWm6YFZWNDXZ5OncjSl2zNF5EDMMvXttk2DkwzzcYFa4547FTqK-kY6V9s05hKPFFGV9Kfkdk5wmrAUyhgCH90iDUwK9cY8caryf2Y1lY-f0L2pHwCY-kfC1Csq9_OJ8-FcaC2Jn8BGtfttpMle2gylLxSCka-yVWEpwlB57YgeG7oPObl3qTUo4ZjB4y_lvqOrNRzfBSsFFUXy7tnD032umRseORfsft6WnPZ3W6bsvlxK6-PmyaBheIEO_BzLA0vZ8ZTUvdWU-q3dZ7PMOf-ZIH86bFsUHaixKcPc3b4Et2wkVQ9dNS6vXQxWDVjxuexddunbScYl-r73H0ieSBGpsic2ealds0_prkQBJGVj-K71EVM6H9bFv3BtZ16Po0ohbIi_V3QVV35lVy1kctDEbqSuQ3F1h68xINyLxDzO9n2T2MoLGtPUnes6R65cCvmTX9QufwaKNjEAwAbO6KsLvm4WqWNKIlzTUfNl1sidZ4oyzSYbtrRdKDiJddd7y_5Q1b4C9-aAwUd4eqsoisAsXJwjVkuDN6J2mvjCHFihX-lmJwAElEPfuFpwM1GdNT_pWeIPeCikgA9s";

// Correct TidyCal's API base URL
const TIDYCAL_BASE_URL = "https://tidycal.com/api";

// Default booking type ID (if available)
const DEFAULT_BOOKING_TYPE_ID = "1128016";

// Test data for fallback responses
const TEST_BOOKING_TYPES = [
  {
    id: "1128016",
    name: "DNA Assessment Discussion",
    duration: 30,
    description: "Schedule a 30-minute discussion about your DNA assessment results."
  },
  {
    id: "67890",
    name: "Intellectual Assessment Consultation",
    duration: 60,
    description: "Schedule a 60-minute consultation to discuss your intellectual assessment."
  }
];

// Helper function to get date range for a month
function getDateRangeForMonth(month: string): { starts_at: string, ends_at: string } {
  const [year, monthNum] = month.split('-');
  const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(monthNum), 0); // Last day of month
  
  // Format dates to ISO string and add Z for UTC
  return {
    starts_at: startDate.toISOString().split('.')[0] + "Z",
    ends_at: endDate.toISOString().split('.')[0] + "Z"
  };
}

// Helper function to get date range for a specific date (full day)
function getDateRangeForDay(date: string): { starts_at: string, ends_at: string } {
  const startDate = new Date(`${date}T00:00:00`);
  const endDate = new Date(`${date}T23:59:59`);
  
  // Format dates to ISO string and add Z for UTC
  return {
    starts_at: startDate.toISOString().split('.')[0] + "Z",
    ends_at: endDate.toISOString().split('.')[0] + "Z"
  };
}

// Generate test dates for fallback
function generateTestDates(month: string, count = 10) {
  const [year, monthStr] = month.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const dates = [];
  
  for (let i = 1; i <= 28; i += 3) {
    const testDate = new Date(parseInt(year, 10), monthIndex, i);
    if (testDate >= new Date()) {
      const formattedDate = `${year}-${monthStr}-${i.toString().padStart(2, '0')}`;
      dates.push(formattedDate);
      if (dates.length >= count) break;
    }
  }
  
  return dates;
}

// Generate test time slots for fallback
function generateTestTimeSlots(date: string) {
  const slots = [];
  
  for (let hour = 9; hour < 17; hour += 2) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    slots.push({
      id: `slot-${date}-${hour}`,
      date: date,
      start_time: startTime,
      end_time: endTime,
      timezone: "America/New_York",
      available: true
    });
  }
  
  return slots;
}

// Enhanced error handling wrapper for fetch calls
async function fetchWithErrorHandling(url: string, options: RequestInit) {
  console.log(`Making request to: ${url}`);
  console.log(`Request options:`, JSON.stringify(options));

  try {
    const response = await fetch(url, options);
    let responseText;
    
    try {
      responseText = await response.text();
    } catch (error) {
      console.error("Failed to get response text:", error);
      return { 
        success: false, 
        error: "Failed to read response"
      };
    }
    
    console.log(`Response status: ${response.status}`);
    
    // Only log first 500 chars if response is large
    if (responseText.length > 500) {
      console.log(`Response body (truncated): ${responseText.substring(0, 500)}...`);
    } else {
      console.log(`Response body: ${responseText}`);
    }
    
    // Check if response is valid
    if (!response.ok) {
      throw new Error(`API error (${response.status}): ${responseText.substring(0, 200)}`);
    }
    
    // Try to parse JSON response
    try {
      return { 
        success: true, 
        data: JSON.parse(responseText),
        status: response.status
      };
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }
  } catch (fetchError) {
    console.error("Fetch error:", fetchError);
    return { 
      success: false, 
      error: fetchError.message
    };
  }
}

// Serve endpoint
serve(async (req) => {
  console.log("Received request:", req.url);
  
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const body = req.method === "POST" ? await req.json() : {};
    const path = body.path || "";

    console.log(`Processing request for path: ${path}`, body);

    // Handle API health check first
    if (path === "health-check") {
      try {
        // Simple health check to verify our API connection
        const healthCheckUrl = `${TIDYCAL_BASE_URL}/booking-types`;
        const result = await fetchWithErrorHandling(healthCheckUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
          }
        });
        
        if (result.success) {
          return new Response(JSON.stringify({ 
            status: "ok", 
            message: "API connection successful",
            api_data: result.data,
            timestamp: new Date().toISOString() 
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          // API connection failed but we'll still return a 200 response for the front-end
          return new Response(JSON.stringify({ 
            status: "error", 
            message: "API connection failed",
            error: result.error,
            timestamp: new Date().toISOString() 
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (healthCheckError) {
        console.error("Health check error:", healthCheckError);
        return new Response(JSON.stringify({ 
          status: "error", 
          message: "Health check failed",
          error: healthCheckError.message 
        }), {
          status: 200, // Keep 200 for frontend
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Switch for other endpoints
    switch (path) {
      case "list-booking-types":
        return await listBookingTypes();
      case "booking-type":
        if (body.bookingTypeId) {
          return await getBookingType(body.bookingTypeId);
        }
        return new Response(JSON.stringify({ error: "Booking type ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      case "available-dates":
        if (!body.bookingTypeId) {
          return new Response(JSON.stringify({ error: "Booking type ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return await getAvailableDates(body.month, body.bookingTypeId);
      case "time-slots":
        if (!body.bookingTypeId) {
          return new Response(JSON.stringify({ error: "Booking type ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return await getTimeSlots(body.date, body.bookingTypeId);
      case "create-booking":
        return await createBooking(body);
      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint", path }), {
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

// List all booking types
async function listBookingTypes() {
  try {
    console.log(`Fetching all booking types`);
    const url = `${TIDYCAL_BASE_URL}/booking-types`;
    
    const result = await fetchWithErrorHandling(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      }
    });
    
    if (result.success) {
      console.log("Successfully fetched booking types:", result.data);
      
      // Transform the response to match our expected format
      const transformedData = {
        data: result.data.data.map(item => ({
          id: item.id.toString(),
          name: item.title || "Unnamed Booking Type",
          duration: item.duration_minutes || 30,
          description: item.description || "",
          price: item.price,
          currency: item.currency || "USD"
        }))
      };
      
      return new Response(JSON.stringify(transformedData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      console.log("API call failed, returning test data");
      // Return test data if API call fails
      const testData = {
        data: TEST_BOOKING_TYPES
      };
      
      return new Response(JSON.stringify(testData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching booking types:", error);
    
    // Return test data on error
    const testData = {
      data: TEST_BOOKING_TYPES
    };
    
    return new Response(JSON.stringify(testData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Get booking type details
async function getBookingType(bookingTypeId: string) {
  try {
    if (!bookingTypeId) {
      throw new Error("Booking type ID is required");
    }
    
    console.log(`Fetching booking type: ${bookingTypeId}`);
    const url = `${TIDYCAL_BASE_URL}/booking-types/${bookingTypeId}`;
    
    const result = await fetchWithErrorHandling(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      }
    });
    
    if (result.success && result.data) {
      console.log("Booking type data:", result.data);
      
      // Transform the response to match our expected format
      const transformedData = {
        id: result.data.id.toString(),
        name: result.data.title || "Unnamed Booking Type",
        duration: result.data.duration_minutes || 30,
        description: result.data.description || "",
        price: result.data.price,
        currency: result.data.currency || "USD"
      };
      
      return new Response(JSON.stringify(transformedData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Return matching test data if API call fails
      const testBookingType = TEST_BOOKING_TYPES.find(bt => bt.id === bookingTypeId) || TEST_BOOKING_TYPES[0];
      
      return new Response(JSON.stringify(testBookingType), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching booking type:", error);
    
    // Return matching test data on error
    const testBookingType = TEST_BOOKING_TYPES.find(bt => bt.id === bookingTypeId) || TEST_BOOKING_TYPES[0];
    
    return new Response(JSON.stringify(testBookingType), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Get available dates for a month
async function getAvailableDates(month: string, bookingTypeId: string) {
  try {
    if (!month) {
      throw new Error("Month parameter is required");
    }
    
    if (!bookingTypeId) {
      throw new Error("Booking type ID is required");
    }

    console.log(`Fetching available dates for month: ${month} and booking type: ${bookingTypeId}`);
    
    // Calculate date range for the month
    const { starts_at, ends_at } = getDateRangeForMonth(month);
    console.log(`Date range for month ${month}: ${starts_at} to ${ends_at}`);
    
    // Correctly construct the URL with query parameters
    const url = `${TIDYCAL_BASE_URL}/booking-types/${bookingTypeId}/timeslots?starts_at=${encodeURIComponent(starts_at)}&ends_at=${encodeURIComponent(ends_at)}`;
    
    const result = await fetchWithErrorHandling(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      }
    });
    
    if (result.success && result.data) {
      console.log("Available dates response:", result.data);
      
      // Extract unique dates from the timeslots response
      let availableDates = [];
      const dateSet = new Set();
      
      // Handle both direct array and data.data array formats
      const timeslots = Array.isArray(result.data.data) ? result.data.data : 
                         Array.isArray(result.data) ? result.data : [];
      
      timeslots.forEach(slot => {
        if (slot.starts_at) {
          // Extract date part from the ISO timestamp
          const date = slot.starts_at.split('T')[0];
          dateSet.add(date);
        }
      });
      
      availableDates = Array.from(dateSet);
      console.log(`Extracted ${availableDates.length} unique available dates`);
      
      return new Response(JSON.stringify({ available_dates: availableDates }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Generate test dates if the API call fails
      console.log("No available dates received, generating test dates");
      const testDates = generateTestDates(month);
      
      return new Response(JSON.stringify({ available_dates: testDates }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching available dates:", error);
    
    // Generate test dates on error
    const testDates = generateTestDates(month);
    
    return new Response(JSON.stringify({ available_dates: testDates }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Get time slots for a specific date
async function getTimeSlots(date: string, bookingTypeId: string) {
  try {
    if (!date) {
      throw new Error("Date is required");
    }
    
    if (!bookingTypeId) {
      throw new Error("Booking type ID is required");
    }

    console.log(`Fetching time slots for date: ${date} and booking type: ${bookingTypeId}`);
    
    // Calculate date range for the day
    const { starts_at, ends_at } = getDateRangeForDay(date);
    console.log(`Date range for day ${date}: ${starts_at} to ${ends_at}`);
    
    // Correctly construct the URL with query parameters
    const url = `${TIDYCAL_BASE_URL}/booking-types/${bookingTypeId}/timeslots?starts_at=${encodeURIComponent(starts_at)}&ends_at=${encodeURIComponent(ends_at)}`;
    
    const result = await fetchWithErrorHandling(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      }
    });
    
    if (result.success && result.data) {
      console.log("Time slots response:", result.data);
      
      // Transform slots to match our expected format
      let timeSlots = [];
      
      // Handle both direct array and data.data array formats
      const slots = Array.isArray(result.data.data) ? result.data.data : 
                   Array.isArray(result.data) ? result.data : [];
      
      if (slots.length > 0) {
        timeSlots = slots.map(slot => {
          // Extract time parts from ISO strings
          const startTime = slot.starts_at.split('T')[1].substring(0, 5);
          const endTime = slot.ends_at.split('T')[1].substring(0, 5);
          
          return {
            id: slot.id ? slot.id.toString() : `slot-${date}-${startTime}`,
            date: date,
            start_time: startTime,
            end_time: endTime,
            timezone: slot.timezone || "UTC",
            available: true,
            // Original data for debugging
            original_starts_at: slot.starts_at,
            original_ends_at: slot.ends_at
          };
        });
      } else {
        console.log("No time slots found in API response, generating test slots");
        timeSlots = generateTestTimeSlots(date);
      }
      
      return new Response(JSON.stringify({ time_slots: timeSlots }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Generate test time slots if the API call fails
      console.log("No time slots received, generating test slots");
      const testSlots = generateTestTimeSlots(date);
      
      return new Response(JSON.stringify({ time_slots: testSlots }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching time slots:", error);
    
    // Generate test time slots on error
    const testSlots = generateTestTimeSlots(date);
    
    return new Response(JSON.stringify({ time_slots: testSlots }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Create a booking
async function createBooking(bookingData: {
  name: string;
  email: string;
  time_slot_id: string;
  timezone: string;
  bookingTypeId: string;
}) {
  try {
    if (!bookingData.name || !bookingData.email || !bookingData.time_slot_id || !bookingData.timezone || !bookingData.bookingTypeId) {
      throw new Error("Missing required booking information");
    }

    console.log("Creating booking with data:", bookingData);
    
    // CRITICAL FIX: Use the correct API endpoint structure based on the Python script
    const url = `${TIDYCAL_BASE_URL}/booking-types/${bookingData.bookingTypeId}/bookings`;
    
    // Get the timestamp from the time slot ID
    let startsAt = "";
    
    // If it's a real time slot ID from the TidyCal API
    if (bookingData.time_slot_id.includes('T')) {
      startsAt = bookingData.time_slot_id;
    } 
    // If it's our generated test time slot ID 
    else {
      const timeSlotIdParts = bookingData.time_slot_id.split('-');
      if (timeSlotIdParts.length < 4) {
        throw new Error(`Invalid time slot ID format: ${bookingData.time_slot_id}`);
      }
      
      // Extract date and time components - handle both real and test IDs
      const dateStr = timeSlotIdParts[1] || "2025-04-01";
      const timeStr = timeSlotIdParts[2] || "09:00";
      
      // Create the ISO format string
      startsAt = `${dateStr}T${timeStr}:00.000000Z`;
    }
    
    console.log("Using starts_at:", startsAt);
    
    // CRITICAL FIX: Format the request body exactly as needed by TidyCal API
    const requestBody = {
      starts_at: startsAt,
      name: bookingData.name,
      email: bookingData.email,
      timezone: bookingData.timezone
    };
    
    console.log("Request body:", requestBody);
    
    const result = await fetchWithErrorHandling(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${TIDYCAL_API_KEY}`,
      },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      console.log("Booking response:", result.data);
      
      // Extract the response data properly
      const responseData = result.data.data || result.data;
      
      const transformedData = {
        id: responseData.id?.toString() || "booking-id",
        status: responseData.status || "confirmed",
        meeting_link: responseData.meeting_url,
        payment_link: responseData.payment_link,
        price: responseData.price,
        currency: responseData.currency,
        starts_at: responseData.starts_at,
        ends_at: responseData.ends_at
      };
      
      return new Response(JSON.stringify(transformedData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Return detailed error information
      console.error("Booking creation failed:", result.error);
      return new Response(JSON.stringify({ 
        error: true,
        message: `Booking creation failed: ${result.error || "Unknown error"}`,
        details: result.data || {}
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    
    // Return error information
    return new Response(JSON.stringify({ 
      error: true,
      message: `Error creating booking: ${error.message}`
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
