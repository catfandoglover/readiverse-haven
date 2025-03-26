
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainMenu from "@/components/navigation/MainMenu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Loader2, MessageCircleMore } from "lucide-react";
import { cn } from "@/lib/utils";
import PromptCard from "@/components/virgil/PromptCard";
import WelcomeContainer from "@/components/virgil/WelcomeContainer";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ConversationHistorySidebar from "@/components/virgil/ConversationHistorySidebar";

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

interface Prompt {
  id: string | number;
  user_title: string;
  user_subtitle?: string;
  section?: string;
  icon_display?: string;
  context?: string;
  initial_message?: string;
}

const WELCOME_DISMISSED_KEY = "virgil_welcome_dismissed";

const mapDbPromptToPromptCard = (dbPrompt: DbPrompt) => {
  console.log("Processing DB prompt:", dbPrompt);
  return {
    id: dbPrompt.id,
    user_title: dbPrompt.user_title || "Untitled Prompt",
    user_subtitle: dbPrompt.user_subtitle,
    section: dbPrompt.section || "intellectual",
    icon_display: dbPrompt.icon_display || "💭",
    context: dbPrompt.context || "chat",
    initial_message: dbPrompt.prompt || dbPrompt.initial_message || "Let's have a conversation.",
  };
};

const VirgilModes: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid">("grid");
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const welcomeDismissed = localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
    setShowWelcome(!welcomeDismissed);
  }, []);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    
    const user = supabase.auth.getUser();
    if (user) {
      console.log("Would store welcome dismissed preference for user in database");
    }
  };

  const { data: prompts, isLoading, error } = useQuery({
    queryKey: ["virgilPrompts"],
    queryFn: async () => {
      console.log("Fetching prompts...");
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .or('context.eq.chat,context.is.null');
        
        if (error) {
          console.error("Error fetching prompts:", error);
          toast.error("Failed to load conversation prompts");
          throw new Error(error.message);
        }
        
        console.log("Raw data from database:", data);
        
        if (!data || data.length === 0) {
          console.log("No prompts returned from the database");
        }
        
        if (data && data.length > 0) {
          console.log("Sample prompt:", data[0]);
        }
        
        return data || [];
      } catch (err) {
        console.error("Exception in fetchPrompts:", err);
        return [];
      }
    }
  });

  const formattedPrompts = prompts ? prompts.map(mapDbPromptToPromptCard) : [];
  
  const intellectualPrompts = formattedPrompts.filter(p => (p.section?.toLowerCase() === 'intellectual'));
  const emotionalPrompts = formattedPrompts.filter(p => (p.section?.toLowerCase() === 'emotional'));
  const practicalPrompts = formattedPrompts.filter(p => (p.section?.toLowerCase() === 'practical'));
  const otherPrompts = formattedPrompts.filter(p => 
    !['intellectual', 'emotional', 'practical'].includes(p.section?.toLowerCase() || '')
  );

  const sortAlphabetically = (prompts: Prompt[]) => {
    return [...prompts].sort((a, b) => a.user_title.localeCompare(b.user_title));
  };

  const sortedIntellectualPrompts = sortAlphabetically(intellectualPrompts);
  const sortedEmotionalPrompts = sortAlphabetically(emotionalPrompts);
  const sortedPracticalPrompts = sortAlphabetically(practicalPrompts);
  const sortedOtherPrompts = sortAlphabetically(otherPrompts);

  const handlePromptSelect = (prompt: Prompt) => {
    console.log("Prompt selected:", prompt);
    navigate('/virgil-chat', { 
      state: { 
        promptData: prompt 
      }
    });
  };

  const renderGridView = () => {
    const mobileSpacing = isMobile ? "gap-3" : "gap-4";
    
    const orderedPrompts = [
      ...sortedIntellectualPrompts,
      ...sortedEmotionalPrompts,
      ...sortedPracticalPrompts,
      ...sortedOtherPrompts
    ];
    
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${mobileSpacing}`}>
        {orderedPrompts.map((prompt) => (
          <PromptCard 
            key={prompt.id}
            prompt={prompt}
            viewMode="grid"
            onSelect={() => handlePromptSelect(prompt)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      <div className="flex items-center pt-4 px-8">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOLTS
        </h2>
        <div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50"
            aria-label="Conversation History"
          >
            <MessageCircleMore className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <main className={cn("flex-1 overflow-y-auto", isMobile ? "px-6 py-5" : "px-8 py-6")}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/70" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#E9E7E2]/70">
            <p>Failed to load conversation prompts.</p>
            <Button 
              variant="ghost"
              className="mt-4 text-[#CCFF23]"
              onClick={() => navigate("/virgil")}
            >
              Return to Virgil's Office
            </Button>
          </div>
        ) : (formattedPrompts.length === 0) ? (
          <div className="text-center py-8 text-[#E9E7E2]/70">
            <p>No conversation prompts available.</p>
            <p className="mt-2 text-sm">Check the database to ensure prompts exist.</p>
            <Button 
              variant="ghost"
              className="mt-4 text-[#CCFF23]"
              onClick={() => navigate("/virgil")}
            >
              Return to Virgil's Office
            </Button>
          </div>
        ) : (
          <>
            {showWelcome && <WelcomeContainer onDismiss={handleDismissWelcome} />}
            {renderGridView()}
          </>
        )}
      </main>
      
      {/* Conversation History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent 
          side="right" 
          className="p-0 w-[350px] sm:w-[400px] max-w-full border-0 bg-[#332E38]"
        >
          <ConversationHistorySidebar onClose={() => setShowHistory(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default VirgilModes;
