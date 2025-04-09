import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface Subscription {
  status: string | null;
  tier: string | null;
  isActive: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>({
    status: null,
    tier: null,
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSubscription = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setLastRefresh(new Date());
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('subscription_status, subscription_tier, stripe_customer_id')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        // If no record exists, user doesn't have a subscription
        if (error.code === 'PGRST116') {
          console.log("No customer record found, will set to free tier");
          
          // Create a customer record if none exists
          try {
            const { data: insertData, error: insertError } = await supabase
              .from('customers')
              .upsert({
                user_id: user.id,
                email: user.email || 'no-email@example.com',
                stripe_customer_id: `temp_${user.id}`, // Temporary ID, will be updated by Stripe
                subscription_status: null,
                subscription_tier: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error("Error creating customer record:", insertError);
            } else {
              console.log("Created customer record with free tier");
            }
          } catch (createError) {
            console.error("Exception creating customer record:", createError);
          }
          
          setSubscription({
            status: null,
            tier: 'free', // Default to free tier
            isActive: false
          });
        } else {
          throw error;
        }
      } else if (data) {
        console.log("Setting subscription from DB:", data);
        
        // If subscription status is null but has a stripe_customer_id, 
        // check if there's an active subscription directly with Stripe
        if ((data.subscription_status === null || data.subscription_tier === null) && 
             data.stripe_customer_id && !data.stripe_customer_id.startsWith('temp_')) {
          
          console.log("Customer has Stripe ID but no subscription status, checking directly with Stripe API...");
          
          try {
            // Call our Edge Function to manually check subscription via Stripe API
            const { data: stripeData, error: stripeError } = await supabase.functions.invoke('manual-subscription-check', {
              body: { 
                userId: user.id,
                stripeCustomerId: data.stripe_customer_id
              }
            });
            
            if (stripeError) {
              console.error("Error checking subscription with Stripe:", stripeError);
            } else if (stripeData?.isActive) {
              console.log("Found active subscription via direct Stripe check:", stripeData);
              
              // If Stripe subscription is active but DB record is not, update DB and use Stripe data
              const { error: updateError } = await supabase
                .from('customers')
                .update({
                  subscription_status: 'active',
                  subscription_tier: 'surge',
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);
                
              if (updateError) {
                console.error("Error updating customer with Stripe subscription:", updateError);
              } else {
                console.log("Updated customer record with Stripe subscription data");
                
                // Use the Stripe subscription data for the immediate UI update
                setSubscription({
                  status: 'active',
                  tier: 'surge',
                  isActive: true
                });
                
                // Skip the normal DB data setting below
                return;
              }
            }
          } catch (stripeCheckError) {
            console.error("Exception during Stripe subscription check:", stripeCheckError);
          }
        }
        
        // Normal path - use database subscription data
        setSubscription({
          status: data.subscription_status,
          tier: data.subscription_tier || 'free', // Default to free if tier is null
          isActive: ['active', 'trialing'].includes(data.subscription_status || '')
        });
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscription when user changes
  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Add periodic refresh every 5 minutes when the app is active
  useEffect(() => {
    // Only set up refresh when user is logged in
    if (!user) return;
    
    // Schedule periodic refresh
    const refreshInterval = setInterval(() => {
      console.log("Scheduled refresh of subscription data");
      fetchSubscription();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up on unmount
    return () => clearInterval(refreshInterval);
  }, [user]);

  // Add refresh on window focus
  useEffect(() => {
    if (!user) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if it's been more than 1 minute since last refresh
        const timeSinceLastRefresh = new Date().getTime() - lastRefresh.getTime();
        if (timeSinceLastRefresh > 60 * 1000) {
          console.log("Refreshing subscription data on window focus");
          fetchSubscription();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on window focus for browsers that don't support visibilitychange
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [user, lastRefresh]);

  return { subscription, isLoading, error, refresh: fetchSubscription };
} 