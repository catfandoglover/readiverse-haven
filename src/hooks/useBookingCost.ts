
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useBookingCost() {
  const [cost, setCost] = useState<string>("$59.00"); // Default fallback value
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCost = async () => {
      setIsLoading(true);
      
      try {
        // Call the get-booking-cost edge function
        const { data, error } = await supabase.functions.invoke('get-booking-cost');
        
        if (error) {
          console.error("Error fetching booking cost:", error);
          setError("Failed to fetch cost");
          setIsLoading(false);
          return;
        }

        // Format the cost with a dollar sign
        if (data?.cost) {
          setCost(`${data.cost}`);
        }
      } catch (err) {
        console.error("Exception fetching booking cost:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCost();
  }, []);

  return {
    cost,
    isLoading,
    error
  };
}
