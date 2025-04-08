
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import TokenUsageDisplay from '@/components/subscription/TokenUsageDisplay';

const UpgradePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBack = () => {
    navigate(-1);
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeValid(null);
      setPromoDiscount(0);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('promo_codes')
        .select('discount_percent, active, expires_at, max_uses, current_uses')
        .eq('code', promoCode.trim())
        .single();

      if (error) {
        setPromoCodeValid(false);
        setPromoDiscount(0);
        return;
      }

      // Check if promo code is valid
      const isActive = data.active;
      const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
      const isMaxedOut = data.max_uses && data.current_uses >= data.max_uses;

      if (isActive && !isExpired && !isMaxedOut) {
        setPromoCodeValid(true);
        setPromoDiscount(data.discount_percent);
        toast({
          title: "Promo code applied!",
          description: `You'll get ${data.discount_percent}% off your subscription.`,
        });
      } else {
        setPromoCodeValid(false);
        setPromoDiscount(0);
        toast({
          title: "Invalid promo code",
          description: isExpired ? "This code has expired." : 
                      isMaxedOut ? "This code has reached its usage limit." : 
                      "This code is not valid.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error validating promo code:", err);
      setPromoCodeValid(false);
      setPromoDiscount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to upgrade.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnTo: '/upgrade' } });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          promoCode: promoCodeValid ? promoCode : null
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast({
        title: "Checkout failed",
        description: "Failed to start the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate discounted price
  const basePrice = 8.99;
  const discountedPrice = promoCodeValid && promoDiscount > 0
    ? (basePrice * (100 - promoDiscount) / 100).toFixed(2)
    : basePrice.toFixed(2);

  return (
    <div className="min-h-screen bg-[#E9E7E2] text-[#332E38] flex flex-col">
      <header className="p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="text-[#332E38]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 font-oxanium text-sm uppercase tracking-wider font-bold">Subscription</h1>
      </header>
      
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="font-libre-baskerville text-2xl font-bold mb-2">Upgrade to SURGE</h2>
          <p className="text-[#332E38]/80">
            Unlimited conversations with Virgil and premium features.
          </p>
        </div>
        
        <div className="mb-6">
          <TokenUsageDisplay />
        </div>
        
        <div className="bg-white rounded-xl overflow-hidden mb-8 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Monthly Subscription</h3>
                <p className="text-[#332E38]/70 text-sm">Unlimited AI conversations</p>
              </div>
              <div className="flex items-baseline">
                {promoDiscount > 0 && (
                  <span className="line-through text-[#332E38]/50 text-sm mr-2">${basePrice.toFixed(2)}</span>
                )}
                <span className="font-bold text-xl">${discountedPrice}</span>
                <span className="text-sm text-[#332E38]/70 ml-1">/mo</span>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <h4 className="font-bold mb-4">Included Features</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Unlimited Virgil conversations</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Chat with longer AI responses</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Cancel anytime</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Promo Code</label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className={`bg-white border ${
                  promoCodeValid === true 
                    ? 'border-green-500' 
                    : promoCodeValid === false 
                    ? 'border-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {promoCodeValid === true && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {promoCodeValid === false && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={validatePromoCode}
              disabled={isLoading || !promoCode.trim()}
            >
              Apply
            </Button>
          </div>
          {promoCodeValid === true && (
            <p className="text-green-600 text-sm mt-1">
              {promoDiscount}% discount applied!
            </p>
          )}
          {promoCodeValid === false && (
            <p className="text-red-600 text-sm mt-1">
              Invalid or expired promo code
            </p>
          )}
        </div>
        
        <Button 
          className="w-full py-6 h-auto text-base rounded-xl bg-[#373763] hover:bg-[#373763]/90 text-white font-oxanium uppercase tracking-wider font-bold"
          onClick={handleUpgradeClick}
          disabled={isLoading}
        >
          <Zap className="h-5 w-5 mr-2" />
          {isLoading ? "Processing..." : "Subscribe Now"}
        </Button>
        
        <p className="text-center text-[#332E38]/60 text-xs mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          You can cancel your subscription at any time.
        </p>
      </main>
    </div>
  );
};

export default UpgradePage;
