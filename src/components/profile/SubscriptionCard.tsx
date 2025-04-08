
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Sparkles, CheckCircle, Clock } from 'lucide-react';

export const SubscriptionCard: React.FC = () => {
  const { isLoading, isSubscribed, tier, status, createCheckoutSession, createPortalSession } = useSubscription();

  if (isLoading) {
    return (
      <Card className="w-full bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Subscription</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
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
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        {isSubscribed ? (
          <Button 
            onClick={() => createPortalSession()}
            className="w-full bg-[#373763] hover:bg-[#373763]/90"
          >
            Manage Subscription
          </Button>
        ) : (
          <>
            <Button 
              onClick={() => createCheckoutSession('monthly')}
              className="w-full bg-[#373763] hover:bg-[#373763]/90"
            >
              Upgrade to SURGE (Monthly)
            </Button>
            <Button 
              onClick={() => createCheckoutSession('annual')}
              className="w-full bg-[#373763]/90 hover:bg-[#373763]"
            >
              Upgrade to SURGE (Annual)
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
