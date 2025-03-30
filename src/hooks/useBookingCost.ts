
import { useState, useEffect } from 'react';

export function useBookingCost() {
  const [cost, setCost] = useState<string>("$99.00");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // For now, we're using a fixed price, but this could be fetched from an API
  // or from the Supabase database in the future
  useEffect(() => {
    setIsLoading(false);
    setCost("$99.00");
  }, []);

  return {
    cost,
    isLoading,
    error
  };
}
