
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useBookingCost() {
  const [cost, setCost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const DEFAULT_COST = "59.00 USD";

  useEffect(() => {
    const fetchBookingCost = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-booking-cost');
        
        if (error) {
          console.error('Error fetching booking cost:', error);
          setError('Could not load booking price information');
          setCost(DEFAULT_COST); // Set default fallback cost
          return;
        }

        if (data && data.cost) {
          setCost(`${data.cost} USD`);
        } else {
          console.warn('No price information received from API, using default');
          setCost(DEFAULT_COST); // Set default fallback cost
        }
      } catch (err) {
        console.error('Exception:', err);
        setError('Error loading price information');
        setCost(DEFAULT_COST); // Set default fallback cost
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingCost();
  }, []);

  return { cost, isLoading, error };
}
