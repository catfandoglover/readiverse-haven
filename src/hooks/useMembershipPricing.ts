import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Constants for plan IDs
const PLAN_IDS = {
  FREE: 1,
  SURGE: 3
};

// Constants for revenue item IDs - these should match your Stripe Price IDs
const SURGE_PLAN_ID = '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a';

// Default pricing if API call fails
const DEFAULT_PRICING = {
  id: PLAN_IDS.SURGE,
  title: 'Surge',
  yearlyPrice: 169,
  monthlyPrice: 20,
  yearlyPriceId: SURGE_PLAN_ID,
  monthlyPriceId: SURGE_PLAN_ID
};

export function useMembershipPricing() {
  const [pricingData, setPricingData] = useState(DEFAULT_PRICING);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      setIsLoading(true);
      
      try {
        const { data: pricingResponse, error: functionError } = await supabase.functions.invoke('get-membership-prices');
        
        if (functionError) {
          throw new Error(`Edge function error: ${functionError.message}`);
        }

        if (pricingResponse) {
          console.log('Edge function response:', pricingResponse);
          
          // Create a valid Stripe price ID format if one isn't provided
          const monthlyPriceId = pricingResponse.monthly?.price_id || SURGE_PLAN_ID;
          const yearlyPriceId = pricingResponse.annual?.price_id || SURGE_PLAN_ID;
          
          console.log('Price IDs being used:', { monthlyPriceId, yearlyPriceId });
          
          setPricingData({
            id: PLAN_IDS.SURGE,
            title: 'Surge',
            yearlyPrice: pricingResponse.annual?.price || 169,
            monthlyPrice: pricingResponse.monthly?.price || 20,
            yearlyPriceId: yearlyPriceId,
            monthlyPriceId: monthlyPriceId
          });
        }
      } catch (err) {
        console.error('Error fetching membership pricing:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Keep using default pricing if there's an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, []);

  return { pricingData, isLoading, error };
} 