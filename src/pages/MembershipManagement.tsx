import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMembershipPricing } from "@/hooks/useMembershipPricing";

// Constants for plan IDs
const PLAN_IDS = {
  FREE: 1,
  SURGE_MONTHLY: 2,
  SURGE_ANNUAL: 3
};

// Constants for revenue item IDs
const SURGE_PLAN_ID = '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a';

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
  const [activeTab, setActiveTab] = useState<"free" | "surge">("free");
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly" | null>(null);
  const [pricingData, setPricingData] = useState<PricingOption | null>(null);
  const { pricingData: pricingDataFromHook } = useMembershipPricing();

  // Update pricing data when tab changes
  useEffect(() => {
    if (activeTab === "surge") {
      setPricingData({
        id: PLAN_IDS.SURGE_MONTHLY,
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

  // Add a log to verify what pricing data we're using
  useEffect(() => {
    console.log('Current pricing data:', pricingData);
  }, [pricingData]);

  const handleBack = () => {
    navigate('/profile/settings');
  };

  const handleDowngrade = () => {
    // Currently just a UI placeholder
    console.log("Downgrade membership clicked");
  };

  const handlePlanSelect = (plan: "yearly" | "monthly") => {
    setSelectedPlan(plan);
  };

  const handleJoin = () => {
    // Log the selected plan and its ID
    const priceId = SURGE_PLAN_ID;
      
    console.log(`Join ${activeTab} plan with ${selectedPlan} billing. Price ID: ${priceId}`);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(0)}`;
  };

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
                className="w-full h-[52px] mb-3 rounded-xl bg-[#EAE7E1] hover:bg-[#EAE7E1]/90 text-[#1D3A35] font-oxanium uppercase text-sm font-bold flex justify-center items-center"
              >
                CURRENT MEMBERSHIP
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
              
              <Button 
                onClick={handleJoin}
                disabled={!selectedPlan}
                className={cn(
                  "w-full h-[52px] mb-3 rounded-xl font-oxanium uppercase text-sm font-bold flex justify-center items-center transition-colors",
                  selectedPlan 
                    ? "bg-[#3B4777] hover:bg-[#3B4777]/90 text-[#E9E7E2]" 
                    : "bg-[#231923]/50 backdrop-blur-sm text-[#E9E7E2]/70 hover:text-[#E9E7E2]/90"
                )}
              >
                JOIN THE CONVERSATION
              </Button>
              
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