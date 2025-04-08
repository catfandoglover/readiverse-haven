
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Show confetti effect
    let confettiInterval: number | null = null;
    
    const showConfetti = async () => {
      try {
        // Dynamically import confetti for better error handling
        const confettiModule = await import('canvas-confetti');
        const confetti = confettiModule.default;
        
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        confettiInterval = window.setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          
          if (timeLeft <= 0) {
            if (confettiInterval) {
              clearInterval(confettiInterval);
            }
            return;
          }
          
          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            startVelocity: 30,
            particleCount,
            spread: 360,
            ticks: 60,
            origin: {
              x: randomInRange(0.1, 0.9),
              y: randomInRange(0.1, 0.5)
            },
            colors: ['#CCFF23', '#373763', '#9b87f5'],
            disableForReducedMotion: true
          });
        }, 250);
      } catch (error) {
        console.error('Failed to load confetti:', error);
        // Silently fail - confetti is not critical to the page functionality
      }
    };

    showConfetti();

    return () => {
      if (confettiInterval) {
        clearInterval(confettiInterval);
      }
    };
  }, []);

  useEffect(() => {
    // Verify the session with Stripe
    const verifySession = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        // In a real implementation, you might want to verify the session on the server side
        // Here we're just checking if it exists in our database via a subscription status check
        const { data, error } = await supabase.functions.invoke('get-token-usage');
        
        if (error) {
          throw error;
        }
        
        setVerified(data.isSubscriber);
        
        if (data.isSubscriber) {
          toast({
            title: "Subscription activated!",
            description: "You now have unlimited access to Virgil.",
          });
        } else {
          toast({
            title: "Subscription pending",
            description: "Your subscription is being processed.",
          });
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        toast({
          title: "Verification error",
          description: "We couldn't verify your subscription status.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifySession();
  }, [sessionId, toast]);

  const handleContinue = () => {
    navigate('/virgil-modes');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#E9E7E2]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 font-libre-baskerville">Thank You!</h1>
        
        <p className="text-[#332E38]/80 mb-6">
          {verifying ? "Verifying your subscription..." :
           verified ? "Your SURGE subscription is now active. Enjoy unlimited conversations with Virgil!" :
           "Your subscription is being processed. It may take a few moments to activate."}
        </p>
        
        <div className="space-y-4">
          <ul className="text-left space-y-3 bg-[#F8F8F6] p-4 rounded-lg mb-6">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Unlimited AI conversations with Virgil</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Premium features unlocked</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Priority support</span>
            </li>
          </ul>
          
          <Button 
            onClick={handleContinue}
            className="w-full py-2 rounded-xl bg-[#373763] hover:bg-[#373763]/90 text-white flex items-center justify-center"
          >
            Continue to Virgil
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
