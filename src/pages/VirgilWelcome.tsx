
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';

const VirgilWelcome: React.FC = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const navigate = useNavigate();

  // Initial animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setState('transitioning');
      
      // Allow time for header transition before showing chat
      const chatTimer = setTimeout(() => {
        setState('chat');
      }, 500); // 500ms for the header transition

      return () => clearTimeout(chatTimer);
    }, 5000); // 5 seconds for initial display

    // Redirect to DNA results after 2 minutes
    const redirectTimer = setTimeout(() => {
      navigate('/dna/completion');
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      {/* Header - initially invisible, appears during transition */}
      <div 
        className={cn(
          "flex items-center pt-4 px-4 h-14",
          "transition-opacity duration-500",
          state === 'initial' ? 'opacity-0' : 'opacity-100'
        )}
      >
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/70 tracking-wider text-sm font-bold mx-auto">
          VIRGIL
        </h2>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Initial centered text */}
        <div 
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500",
            state === 'initial' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-20 pointer-events-none'
          )}
        >
          <h1 className="font-baskerville text-4xl md:text-5xl text-[#E9E7E2] mb-3">Meet Virgil.</h1>
          <p className="font-inter text-lg text-[#E9E7E2]/70">Your Philosophical Guide</p>
        </div>
        
        {/* Chat interface - only shows after transition */}
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col">
            <VirgilFullScreenChat 
              variant="virgilchat"
              initialMessage="I'm Virgil, your philosophical guide to humanity's great conversation. Your intellectual DNA results are processing in our ideas lab. We'll take you over to your results in about 2 minutes. In the meantime, how was that experience for you?"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirgilWelcome;
