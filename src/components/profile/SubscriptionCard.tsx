
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export const SubscriptionCard: React.FC = () => {
  const { isLoading, isSubscribed, tier, status, createCheckoutSession, createPortalSession } = useSubscription();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for subscription success/cancel URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.get('subscription_success') === 'true') {
      toast.success('Subscription successful! Welcome to SURGE!');
    }
    
    if (params.get('subscription_cancelled') === 'true') {
      toast.info('Subscription checkout was cancelled');
    }
  }, [location.search]);

  const handleCheckout = async (interval: 'monthly' | 'annual') => {
    try {
      setIsProcessing(true);
      const result = await createCheckoutSession(interval);
      if (!result) {
        // If the function returns false, set processing to false since we didn't redirect
        setIsProcessing(false);
      }
      // Don't set processing to false on success since we'll redirect
    } catch (error) {
      console.error('Error in checkout flow:', error);
      toast.error('Failed to start checkout process');
      setIsProcessing(false);
    }
  };

  const handlePortal = async () => {
    try {
      setIsProcessing(true);
      const result = await createPortalSession();
      if (!result) {
        // If the function returns false, set processing to false since we didn't redirect
        setIsProcessing(false);
      }
      // Don't set processing to false on success since we'll redirect
    } catch (error) {
      console.error('Error in portal flow:', error);
      toast.error('Failed to open subscription management');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Subscription</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#373763]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Subscription</CardTitle>
          {isSubscribed ? (
            <Badge className="bg-[#373763]">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[#373763] border-[#373763]">
              Free
            </Badge>
          )}
        </div>
        <CardDescription>
          {isSubscribed ? 'Manage your SURGE subscription' : 'Upgrade to SURGE for unlimited access'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            {isSubscribed ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">SURGE Subscription</p>
                  <p className="text-sm text-gray-500">Unlimited access to all features</p>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-[#373763] mt-0.5" />
                <div>
                  <p className="font-semibold">Free Tier</p>
                  <p className="text-sm text-gray-500">Limited access to features</p>
                </div>
              </>
            )}
          </div>
          
          {isSubscribed && status === 'trialing' && (
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-semibold">Trial Period</p>
                <p className="text-sm text-gray-500">Your subscription is currently in the trial period</p>
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-start gap-2">
              <div className="animate-spin h-5 w-5 text-[#373763] mt-0.5">⟳</div>
              <div>
                <p className="font-semibold">Processing</p>
                <p className="text-sm text-gray-500">Please wait while we process your request...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        {isSubscribed ? (
          <Button 
            onClick={handlePortal}
            className="w-full bg-[#373763] hover:bg-[#373763]/90"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Manage Subscription'}
          </Button>
        ) : (
          <>
            <Button 
              onClick={() => handleCheckout('monthly')}
              className="w-full bg-[#373763] hover:bg-[#373763]/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Upgrade to SURGE (Monthly)'}
            </Button>
            <Button 
              onClick={() => handleCheckout('annual')}
              className="w-full bg-[#373763]/90 hover:bg-[#373763]"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Upgrade to SURGE (Annual)'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
