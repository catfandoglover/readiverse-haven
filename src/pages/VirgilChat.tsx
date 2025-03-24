
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';
import { toast } from 'sonner';

// Define the shape of data coming from the database
interface DbPrompt {
  id: number;
  user_title?: string;
  user_subtitle?: string;
  section?: string;
  icon_display?: string;
  context?: string;
  prompt?: string;
  initial_message?: string;
}

// Transform DB data to the format we need
const formatPrompt = (dbPrompt: DbPrompt) => {
  console.log("Formatting prompt data:", dbPrompt);
  
  return {
    id: dbPrompt.id,
    user_title: dbPrompt.user_title || "Untitled Prompt",
    user_subtitle: dbPrompt.user_subtitle,
    section: dbPrompt.section || "intellectual",
    icon_display: dbPrompt.icon_display || "💭",
    context: dbPrompt.context || "chat",
    initial_message: dbPrompt.prompt || dbPrompt.initial_message || `Let's have a conversation.`,
  };
};

const VirgilChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');

  const { data: dbPrompt, isLoading, error } = useQuery({
    queryKey: ['virgilPrompt', id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Fetching prompt with ID:", id);
      try {
        // Convert string ID to number if needed
        const numericId = isNaN(Number(id)) ? id : Number(id);
        console.log("Using ID for query:", numericId);
        
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', numericId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching prompt:', error);
          toast.error("Failed to load conversation prompt");
          throw new Error(error.message);
        }
        
        console.log("Raw prompt data from database:", data);
        return data;
      } catch (err) {
        console.error("Exception in fetchPrompt:", err);
        return null;
      }
    }
  });

  // Format the prompt data with fallbacks
  const prompt = dbPrompt ? formatPrompt(dbPrompt) : null;
  console.log("Formatted prompt for chat:", prompt);

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
          {prompt.user_title}
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
          <h1 className="font-baskerville text-4xl md:text-5xl text-[#E9E7E2] mb-3">{prompt.user_title}</h1>
          {prompt.user_subtitle && (
            <p className="font-inter text-lg text-[#E9E7E2]/70">{prompt.user_subtitle}</p>
          )}
        </div>
        
        {/* Chat interface - only shows after transition */}
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col">
            <VirgilFullScreenChat 
              variant="virgilchat"
              initialMessage={prompt.initial_message}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirgilChat;
