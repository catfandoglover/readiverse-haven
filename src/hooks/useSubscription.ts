
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  isLoading: boolean;
  isSubscribed: boolean;
  tier: string;
  status: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isLoading: true,
    isSubscribed: false,
    tier: 'free',
    status: null
  });

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!user) {
        setSubscription({
          isLoading: false,
          isSubscribed: false,
          tier: 'free',
          status: null
        });
        return;
      }

      try {
        // Get subscription status from the customers table
        const { data, error } = await supabase
          .from('customers')
          .select('subscription_status, subscription_tier')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const isActive = data.subscription_status === 'active' || 
                         data.subscription_status === 'trialing';
          
          setSubscription({
            isLoading: false,
            isSubscribed: isActive,
            tier: data.subscription_tier || 'free',
            status: data.subscription_status
          });
        } else {
          // No subscription record found
          setSubscription({
            isLoading: false,
            isSubscribed: false,
            tier: 'free',
            status: null
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription({
          isLoading: false,
          isSubscribed: false,
          tier: 'free',
          status: null
        });
      }
    }

    fetchSubscriptionStatus();
  }, [user]);

  const createCheckoutSession = async (billingInterval: 'monthly' | 'annual' = 'monthly') => {
    try {
      const priceId = billingInterval === 'annual' 
        ? '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a'  // Annual billing
        : 'fe95c5c4-2246-4d99-915b-06655ca6fcce'; // Monthly billing
        
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { price_id: priceId, billing_interval: billingInterval }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return false;
    }
  };

  const createPortalSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {});
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating portal session:', error);
      return false;
    }
  };

  return {
    ...subscription,
    createCheckoutSession,
    createPortalSession
  };
}
