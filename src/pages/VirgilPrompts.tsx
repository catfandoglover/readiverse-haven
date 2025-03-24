
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import PromptCard from "@/components/virgil/PromptCard";
import PromptCardList from "@/components/virgil/PromptCardList";

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .ilike("context", "%chat%")
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching prompts:", error);
          return;
        }

        setPrompts(data || []);
      } catch (error) {
        console.error("Error:", error);
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
        ) : prompts.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-[#E9E7E2]/70">No prompts available</div>
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
