
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useBookingCost() {
  const [cost, setCost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fallbackCost = "$59 USD";

  useEffect(() => {
    const fetchBookingCost = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-booking-cost');
        
        if (error) {
          console.error('Error fetching booking cost:', error);
          setError('Could not load booking price information');
          setCost(fallbackCost);
          return;
        }

        if (data && data.cost) {
          setCost(`${data.cost} USD`);
        } else {
          setError('No price information available');
          setCost(fallbackCost);
        }
      } catch (err) {
        console.error('Exception:', err);
        setError('Error loading price information');
        setCost(fallbackCost);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingCost();
  }, []);

  return { cost, isLoading, error };
}
