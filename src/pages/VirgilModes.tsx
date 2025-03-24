
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainMenu from "@/components/navigation/MainMenu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PromptCard from "@/components/virgil/PromptCard";
import WelcomeContainer from "@/components/virgil/WelcomeContainer";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Load the welcome dismissed state from localStorage on component mount
  useEffect(() => {
    const welcomeDismissed = localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
    setShowWelcome(!welcomeDismissed);
  }, []);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    
    // If we have a logged in user, we could also store this preference in Supabase
    // This is a placeholder for that functionality
    const user = supabase.auth.getUser();
    if (user) {
      // Store user preference in database (implementation would depend on your data model)
      console.log("Would store welcome dismissed preference for user in database");
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
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
  
  // Filter prompts by section - only used in list view
  const intellectualPrompts = formattedPrompts.filter(p => (p.section?.toLowerCase() === 'intellectual'));
  const emotionalPrompts = formattedPrompts.filter(p => (p.section?.toLowerCase() === 'emotional'));
  const practicalPrompts = formattedPrompts.filter(p => (p.section?.toLowerCase() === 'practical'));
  const otherPrompts = formattedPrompts.filter(p => 
    !['intellectual', 'emotional', 'practical'].includes(p.section?.toLowerCase() || '')
  );

  // Sort prompts alphabetically by title within each section
  const sortAlphabetically = (prompts: Prompt[]) => {
    return [...prompts].sort((a, b) => a.user_title.localeCompare(b.user_title));
  };

  const sortedIntellectualPrompts = sortAlphabetically(intellectualPrompts);
  const sortedEmotionalPrompts = sortAlphabetically(emotionalPrompts);
  const sortedPracticalPrompts = sortAlphabetically(practicalPrompts);
  const sortedOtherPrompts = sortAlphabetically(otherPrompts);

  const renderListView = () => {
    return (
      <>
        {renderPromptSection("INTELLECTUAL", sortedIntellectualPrompts)}
        {renderPromptSection("EMOTIONAL", sortedEmotionalPrompts)}
        {renderPromptSection("PRACTICAL", sortedPracticalPrompts)}
        {renderPromptSection("OTHER", sortedOtherPrompts)}
      </>
    );
  };

  const renderGridView = () => {
    const mobileSpacing = isMobile ? "gap-3" : "gap-4";
    
    // For grid view, combine the sorted sections in the specified order
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
            onSelect={() => navigate(`/virgil-chat/${prompt.id}`)}
          />
        ))}
      </div>
    );
  };

  const renderPromptSection = (title: string, sectionPrompts: Prompt[]) => {
    if (sectionPrompts.length === 0) return null;
    
    const mobileSpacing = isMobile ? "gap-3 mb-6" : "gap-4 mb-8";
    
    return (
      <div className={cn("mb-8", isMobile && "mb-6")}>
        <h3 className={cn("text-[#9D9D9D] uppercase tracking-wider text-sm font-medium mb-4", isMobile && "mb-3")}>
          {title}
        </h3>
        <div className="space-y-3">
          {sectionPrompts.map((prompt) => (
            <PromptCard 
              key={prompt.id}
              prompt={prompt}
              viewMode="list"
              onSelect={() => navigate(`/virgil-chat/${prompt.id}`)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          BOLTS
        </h2>
        <div>
          <Toggle 
            pressed={viewMode === "list"}
            onPressedChange={toggleViewMode}
            aria-label="Toggle View Mode"
            className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50 data-[state=on]:text-[#E9E7E2] data-[state=on]:bg-[#4A4351]/50"
          >
            {viewMode === "grid" ? (
              <List className="h-5 w-5" />
            ) : (
              <LayoutGrid className="h-5 w-5" />
            )}
          </Toggle>
        </div>
      </div>
      
      <main className={cn("flex-1 overflow-y-auto", isMobile ? "px-3 py-5" : "px-4 py-6")}>
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
            {viewMode === "list" ? renderListView() : renderGridView()}
          </>
        )}
      </main>
    </div>
  );
};

export default VirgilModes;
