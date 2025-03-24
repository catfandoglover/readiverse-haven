import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainMenu from "@/components/navigation/MainMenu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PromptCard from "@/components/virgil/PromptCard";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const navigate = useNavigate();

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
  console.log("Formatted prompts for rendering:", formattedPrompts);

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          Chat with Virgil
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
      
      <main className="flex-1 overflow-y-auto px-4 py-6">
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
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" 
              : "space-y-4"
          )}>
            {formattedPrompts.map((prompt) => (
              <PromptCard 
                key={prompt.id}
                prompt={prompt}
                viewMode={viewMode}
                onSelect={() => navigate(`/virgil-chat/${prompt.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VirgilModes;
