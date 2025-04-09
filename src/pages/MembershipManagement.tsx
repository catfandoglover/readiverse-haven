import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMembershipPricing } from "@/hooks/useMembershipPricing";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

// Constants for plan IDs
const PLAN_IDS = {
  FREE: 1,
  SURGE: 3
};

// Constants for revenue item IDs
const SURGE_PLAN_YEARLY_ID = '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a';
const SURGE_PLAN_MONTHLY_ID = 'price_1RBw2iE88XN52LqVnr33i6xP';

interface PricingOption {
  id: number;
  title: string;
  yearlyPrice: number;
  monthlyPrice: number;
  yearlyPriceId: string;
  monthlyPriceId: string;
}

const MembershipManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"free" | "surge">("free");
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly" | null>(null);
  const [pricingData, setPricingData] = useState<PricingOption | null>(null);
  const { pricingData: pricingDataFromHook } = useMembershipPricing();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get return URL from query params or use default
  const returnUrl = searchParams.get('returnUrl') || '/profile/settings';
  
  // Check if this is a redirect from subscription success
  const sessionId = searchParams.get('session_id');
  
  // Handle subscription success
  useEffect(() => {
    if (sessionId) {
      toast.success("Subscription successfully activated!");
      
      // Navigate back to the original page without the query params
      const cleanUrl = returnUrl || '/profile/settings';
      navigate(cleanUrl, { replace: true });
    }
  }, [sessionId, navigate, returnUrl]);
  
  // Set active tab based on current subscription
  useEffect(() => {
    if (!subscriptionLoading) {
      if (subscription.isActive && subscription.tier === 'surge') {
        setActiveTab('surge');
      } else {
        setActiveTab('free');
      }
    }
  }, [subscription, subscriptionLoading]);

  // Update pricing data when tab changes
  useEffect(() => {
    if (activeTab === "surge") {
      setPricingData({
        id: PLAN_IDS.SURGE,
        title: "Surge",
        yearlyPrice: pricingDataFromHook.yearlyPrice,
        monthlyPrice: pricingDataFromHook.monthlyPrice,
        yearlyPriceId: pricingDataFromHook.yearlyPriceId,
        monthlyPriceId: pricingDataFromHook.monthlyPriceId
      });
    } else {
      setPricingData({
        id: PLAN_IDS.FREE,
        title: "Free",
        yearlyPrice: 0,
        monthlyPrice: 0,
        yearlyPriceId: "",
        monthlyPriceId: ""
      });
    }
  }, [activeTab, pricingDataFromHook]);

  const handleBack = () => {
    navigate(returnUrl);
  };

  const handleDowngrade = async () => {
    if (!user) {
      toast.error("You must be logged in to manage your subscription");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Open the Stripe customer portal to manage/cancel the subscription
      const portalReturnUrl = `${window.location.origin}${location.pathname}?returnUrl=${returnUrl}`;
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        body: { 
          userId: user.id,
          returnUrl: portalReturnUrl
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      toast.error("Failed to access subscription management");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanSelect = (plan: "yearly" | "monthly") => {
    setSelectedPlan(plan);
  };

  const handleJoin = async () => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return;
    }
    
    if (!selectedPlan) {
      toast.error("Please select a billing plan");
      return;
    }
    
    // If user selected the free plan, handle downgrading
    if (activeTab === "free") {
      handleDowngrade();
      return;
    }
    
    // For Surge plan, initiate subscription
    try {
      setIsProcessing(true);
      
      // Pass the current location as the return URL so we can redirect back
      const checkoutReturnUrl = `${window.location.origin}${location.pathname}?returnUrl=${returnUrl}`;
      
      // Log what we're sending to the Edge Function
      console.log("Pricing data:", pricingData);
      
      const requestBody = { 
        userId: user.id,
        userEmail: user.email,
        planType: activeTab,
        billingInterval: selectedPlan,
        returnUrl: checkoutReturnUrl,
        // Pass the price IDs from our hook
        monthlyPriceId: pricingData?.monthlyPriceId,
        yearlyPriceId: pricingData?.yearlyPriceId
      };
      
      console.log("Sending to create-stripe-subscription:", requestBody);
      
      const { data, error } = await supabase.functions.invoke('create-stripe-subscription', {
        body: requestBody
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        toast.success("Redirecting to checkout...");
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(0)}`;
  };

  // Show loading state while fetching subscription status
  if (subscriptionLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#2F1E41] text-[#E9E7E2]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#8453f9] mb-4" />
          <p className="text-[#E9E7E2]">Loading membership details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] text-[#E9E7E2] flex flex-col ${activeTab === "free" ? "bg-[#1D3A35]" : "bg-[#2F1E41]"}`}>
      {/* Fixed Header with back button */}
      <div className={`flex items-center pt-2 px-4 h-14 ${activeTab === "free" ? "bg-[#1D3A35]" : "bg-[#2F1E41]"}`}>
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] focus:outline-none"
          aria-label="Back to Settings"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <div className="w-10 h-10"></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center px-8 py-2">
        <div className="w-[200px]">
          <div className="w-full flex items-center justify-between">
            <button 
              onClick={() => setActiveTab("free")}
              className={cn(
                "px-2 py-2 text-center relative",
                "font-oxanium uppercase text-xs tracking-wider",
                "hover:text-[#E9E7E2]",
                activeTab === "free" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                  : "text-[#E9E7E2]/50"
              )}
            >
              FREE
            </button>
            <button 
              onClick={() => setActiveTab("surge")}
              className={cn(
                "px-2 py-2 text-center relative",
                "font-oxanium uppercase text-xs tracking-wider",
                "hover:text-[#E9E7E2]",
                activeTab === "surge" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                  : "text-[#E9E7E2]/50"
              )}
            >
              SURGE
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col">
        {activeTab === "free" && (
          <div className="flex flex-col items-center justify-between h-full px-4 py-6 max-w-[500px] mx-auto w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="text-center mb-12 mt-6">
                <h1 className="text-3xl font-serif mb-2 text-[#E9E7E2]">Free</h1>
                <p className="text-xl font-serif text-[#E9E7E2]/60">Struck</p>
              </div>

              {/* Bullet Points Container */}
              <div className="w-[250px] mx-auto mt-2 space-y-3">
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#CCFF23] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#1D3A35]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">DAILY SPARK</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#CCFF23] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#1D3A35]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">ACCESS TO LIBRARY</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#CCFF23] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#1D3A35]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">INTELLECTUAL DNA</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#CCFF23] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#1D3A35]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">COURSES, EXAMS, BADGES</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#CCFF23] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#1D3A35]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">6 HOURS/MONTH WITH VIRGIL*</p>
                </div>
              </div>
            </div>

            <div className="w-full mt-auto">
              <Button 
                onClick={handleDowngrade}
                disabled={!subscription.isActive || subscription.tier !== 'surge'}
                className="w-full h-[52px] mb-3 rounded-xl bg-[#EAE7E1] hover:bg-[#EAE7E1]/90 text-[#1D3A35] font-oxanium uppercase text-sm font-bold flex justify-center items-center"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {subscription.isActive && subscription.tier === 'surge' 
                  ? 'DOWNGRADE TO FREE' 
                  : (subscription.tier === 'free' || !subscription.tier) 
                    ? 'CURRENT PLAN' 
                    : 'DOWNGRADE TO FREE'}
              </Button>
              
              <p className="text-center text-[10px] text-[#E9E7E2]/60 mt-2">
                TERMS OF SERVICE
              </p>
            </div>
          </div>
        )}

        {activeTab === "surge" && (
          <div className="flex flex-col items-center justify-between h-full px-4 py-6 max-w-[500px] mx-auto w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="text-center mb-12 mt-6">
                <h1 className="text-3xl font-serif mb-2 text-[#E9E7E2]">Surge</h1>
                <p className="text-xl font-serif text-[#E9E7E2]/60">Unlimited</p>
              </div>

              {/* Bullet Points Container */}
              <div className="w-[250px] mx-auto mt-2 space-y-3">
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#C8A2C8] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#2A282A]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">EVERYTHING IN FREE +</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#C8A2C8] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#2A282A]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">UNLIMITED COURSES</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#C8A2C8] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#2A282A]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">UNLIMITED EXAMS + BADGES</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#C8A2C8] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#2A282A]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">UNLIMITED VIRGIL CHATS</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[#C8A2C8] flex items-center justify-center mr-4">
                    <Check className="w-3 h-3 text-[#2A282A]" />
                  </div>
                  <p className="font-oxanium text-xs uppercase font-bold">INFINITE FLEX CAPACITY</p>
                </div>
              </div>
            </div>

            <div className="w-full mt-auto">
              {/* Only show plan selection if user isn't already on Surge plan */}
              {(!subscription.isActive || subscription.tier !== 'surge') && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button
                    onClick={() => handlePlanSelect("yearly")}
                    data-price-id={pricingData?.yearlyPriceId}
                    className={cn(
                      "rounded-xl p-3 flex flex-col items-start text-left transition-all",
                      "border border-[#E9E7E2]/10",
                      selectedPlan === "yearly"
                        ? "bg-[#413A54]" 
                        : "bg-[#231923]/50 backdrop-blur-sm hover:bg-[#2A2030]/70"
                    )}
                  >
                    <span className="font-oxanium text-xs uppercase">
                      <span className="font-bold text-base">{formatPrice(pricingData?.yearlyPrice || 169)}</span>
                    </span>
                    <span className="font-oxanium text-[10px] uppercase text-[#E9E7E2]/60">per year</span>
                  </button>
                  <button
                    onClick={() => handlePlanSelect("monthly")}
                    data-price-id={pricingData?.monthlyPriceId}
                    className={cn(
                      "rounded-xl p-3 flex flex-col items-start text-left transition-all",
                      "border border-[#E9E7E2]/10",
                      selectedPlan === "monthly"
                        ? "bg-[#413A54]" 
                        : "bg-[#231923]/50 backdrop-blur-sm hover:bg-[#2A2030]/70"
                    )}
                  >
                    <span className="font-oxanium text-xs uppercase">
                      <span className="font-bold text-base">{formatPrice(pricingData?.monthlyPrice || 20)}</span>
                    </span>
                    <span className="font-oxanium text-[10px] uppercase text-[#E9E7E2]/60">per month</span>
                  </button>
                </div>
              )}
              
              <Button 
                onClick={handleJoin}
                disabled={(subscription.isActive && subscription.tier === 'surge') || (!selectedPlan && (!subscription.isActive || subscription.tier !== 'surge'))}
                className={cn(
                  "w-full h-[52px] mb-3 rounded-xl font-oxanium uppercase text-sm font-bold flex justify-center items-center transition-colors",
                  (subscription.isActive && subscription.tier === 'surge')
                    ? "bg-[#3B4777] text-[#E9E7E2]"
                    : selectedPlan 
                      ? "bg-[#3B4777] hover:bg-[#3B4777]/90 text-[#E9E7E2]" 
                      : "bg-[#231923]/50 backdrop-blur-sm text-[#E9E7E2]/70"
                )}
              >
                {isProcessing && (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                )}
                {(subscription.isActive && subscription.tier === 'surge')
                  ? 'CURRENT PLAN'
                  : 'JOIN THE CONVERSATION'}
              </Button>
              
              {/* Show manage subscription button if already subscribed */}
              {subscription.isActive && subscription.tier === 'surge' && (
                <Button 
                  onClick={handleDowngrade}
                  className="w-full h-[52px] mb-3 rounded-xl bg-[#231923]/80 hover:bg-[#231923] text-[#E9E7E2] font-oxanium uppercase text-sm font-bold flex justify-center items-center"
                >
                  {isProcessing && (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  )}
                  MANAGE SUBSCRIPTION
                </Button>
              )}
              
              <p className="text-center text-[10px] text-[#E9E7E2]/60 mt-2">
                TERMS OF SERVICE
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipManagement; 