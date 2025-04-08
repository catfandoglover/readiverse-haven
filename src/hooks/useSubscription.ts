
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      if (!user) {
        toast.error('You must be logged in to subscribe');
        return false;
      }
      
      // Use the price_id directly based on billing interval
      const priceId = billingInterval === 'annual' 
        ? '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a'  // Internal reference for Annual billing
        : 'fe95c5c4-2246-4d99-915b-06655ca6fcce'; // Internal reference for Monthly billing
      
      toast.info('Creating checkout session...');
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { price_id: priceId, billing_interval: billingInterval }
      });
      
      if (error) {
        console.error('Error from create-subscription function:', error);
        toast.error('Failed to create checkout session');
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
        return true;
      } else {
        console.error('No URL returned from checkout session', data);
        toast.error('Failed to create checkout session');
        return false;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
      return false;
    }
  };

  const createPortalSession = async () => {
    try {
      if (!user) {
        toast.error('You must be logged in to manage your subscription');
        return false;
      }
      
      toast.info('Opening subscription management...');
      
      const { data, error } = await supabase.functions.invoke('create-portal-session', {});
      
      if (error) {
        console.error('Error from create-portal-session function:', error);
        toast.error('Failed to open subscription management');
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to Stripe portal:', data.url);
        window.location.href = data.url;
        return true;
      } else {
        console.error('No URL returned from portal session', data);
        toast.error('Failed to open subscription management');
        return false;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to manage subscription');
      return false;
    }
  };

  return {
    ...subscription,
    createCheckoutSession,
    createPortalSession
  };
}
