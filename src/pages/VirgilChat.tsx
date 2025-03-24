
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';

const VirgilChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');

  const { data: prompt, isLoading, error } = useQuery({
    queryKey: ['virgilPrompt', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching prompt:', error);
        throw new Error(error.message);
      }
      
      return data;
    }
  });

  // Initial animation timing
  useEffect(() => {
    if (prompt) {
      const timer = setTimeout(() => {
        setState('transitioning');
        
        // Allow time for header transition before showing chat
        const chatTimer = setTimeout(() => {
          setState('chat');
        }, 500); // 500ms for the header transition

        return () => clearTimeout(chatTimer);
      }, 500); // 0.5 seconds for initial display

      return () => {
        clearTimeout(timer);
      };
    }
  }, [prompt]);

  const handleBack = () => {
    navigate('/virgil-modes');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/70" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] items-center justify-center">
        <p className="text-[#E9E7E2]/70 mb-4">Failed to load conversation prompt.</p>
        <Button 
          variant="ghost"
          className="text-[#CCFF23]"
          onClick={handleBack}
        >
          Return to Virgil Modes
        </Button>
      </div>
    );
  }

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
        <Button
          variant="ghost" 
          size="icon"
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/70 tracking-wider text-sm font-bold mx-auto">
          {prompt.title}
        </h2>
        <div className="w-10 h-10" />
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
          <h1 className="font-baskerville text-4xl md:text-5xl text-[#E9E7E2] mb-3">{prompt.title}</h1>
          {prompt.description && (
            <p className="font-inter text-lg text-[#E9E7E2]/70">{prompt.description}</p>
          )}
        </div>
        
        {/* Chat interface - only shows after transition */}
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col">
            <VirgilFullScreenChat 
              variant="virgilchat"
              initialMessage={prompt.initial_message || `Let's talk about ${prompt.title}.`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirgilChat;
