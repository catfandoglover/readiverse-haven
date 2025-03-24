
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainMenu from "@/components/navigation/MainMenu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PromptCard from "@/components/virgil/PromptCard";

const VirgilModes: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const navigate = useNavigate();

  const { data: prompts, isLoading, error } = useQuery({
    queryKey: ["virgilPrompts"],
    queryFn: async () => {
      console.log("Fetching prompts...");
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("context", "chat");
      
      if (error) {
        console.error("Error fetching prompts:", error);
        throw new Error(error.message);
      }
      
      console.log("Fetched prompts:", data);
      return data || [];
    }
  });

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          Chat with Virgil
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost" 
            size="icon"
            className={cn(
              "w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50",
              viewMode === "list" && "text-[#E9E7E2] bg-[#4A4351]/50"
            )}
            onClick={() => setViewMode("list")}
            aria-label="List View"
          >
            <List className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost" 
            size="icon"
            className={cn(
              "w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50",
              viewMode === "grid" && "text-[#E9E7E2] bg-[#4A4351]/50"
            )}
            onClick={() => setViewMode("grid")}
            aria-label="Grid View"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
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
        ) : (prompts?.length ?? 0) === 0 ? (
          <div className="text-center py-8 text-[#E9E7E2]/70">
            <p>No conversation prompts available.</p>
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
            {prompts?.map((prompt) => (
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
