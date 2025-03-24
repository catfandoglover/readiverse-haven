
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import PromptCard from "@/components/virgil/PromptCard";
import PromptCardList from "@/components/virgil/PromptCardList";
import { toast } from "sonner";

interface Prompt {
  id: number;
  user_title: string;
  user_subtitle: string;
  prompt: string;
  section: string;
  context: string;
}

const VirgilPrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, try to fetch all prompts to see how many there are in total
        const totalResponse = await supabase
          .from("prompts")
          .select("id, context")
          .order("display_order", { ascending: true });
          
        if (totalResponse.error) {
          throw new Error(`Error fetching all prompts: ${totalResponse.error.message}`);
        }
        
        console.log(`Total prompts in database: ${totalResponse.data?.length}`);
        console.log("Prompts with context containing 'chat':", 
          totalResponse.data?.filter(p => p.context && p.context.toLowerCase().includes('chat')).length);
        
        // Now fetch the prompts we want to display
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .ilike("context", "%chat%")
          .order("display_order", { ascending: true });

        if (error) {
          throw new Error(`Error fetching chat prompts: ${error.message}`);
        }

        console.log(`Fetched ${data?.length || 0} chat prompts`);
        if (data) {
          data.forEach(prompt => {
            console.log(`Prompt ID: ${prompt.id}, Title: ${prompt.user_title}, Context: ${prompt.context}`);
          });
        }

        setPrompts(data || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Error:", errorMessage);
        setError(errorMessage);
        toast.error("Failed to load prompts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      <header className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-oxanium text-sm uppercase font-bold tracking-wider text-[#E9E7E2]">
          Virgil's Prompts
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50",
              viewMode === "grid" && "text-[#E9E7E2] bg-[#4A4351]/50"
            )}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50",
              viewMode === "list" && "text-[#E9E7E2] bg-[#4A4351]/50"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-[#E9E7E2]/70">Loading prompts...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full flex-col">
            <div className="text-[#E9E7E2]/70 mb-2">Error loading prompts</div>
            <div className="text-[#E9E7E2]/50 text-sm">{error}</div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex justify-center items-center h-full flex-col">
            <div className="text-[#E9E7E2]/70 mb-2">No prompts available</div>
            <div className="text-[#E9E7E2]/50 text-sm">Try refreshing the page or check back later</div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <PromptCardList key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VirgilPrompts;
