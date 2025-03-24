
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, LayoutGrid, List, AlertTriangle, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import PromptCard from "@/components/virgil/PromptCard";
import PromptCardList from "@/components/virgil/PromptCardList";
import { toast } from "sonner";

interface Prompt {
  id: number;
  user_title?: string;
  user_subtitle?: string;
  prompt?: string;
  section?: string;
  context?: string;
}

const VirgilPrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchPrompts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("===== FETCHING PROMPTS =====");
      
      // Direct approach to get ALL prompts without any filtering
      const { data, error } = await supabase
        .from("prompts")
        .select("*");

      if (error) {
        throw new Error(`Error fetching prompts: ${error.message}`);
      }

      console.log("===== RAW PROMPTS DATA =====", data);
      setRawData(data || []);
      
      if (!data || data.length === 0) {
        console.log("No prompts found in database");
        setPrompts([]);
        setIsLoading(false);
        return;
      }

      // Ensure each object in the data array has an id property
      // This addresses issues where the id might be missing
      const validData = data.filter(item => item && typeof item.id !== 'undefined');
      
      if (validData.length === 0) {
        throw new Error("No valid prompts found. All retrieved items are missing an ID.");
      }

      // Transform the data to ensure all expected fields are present
      const processedPrompts = validData.map(prompt => ({
        id: prompt.id,
        user_title: prompt.user_title || undefined,
        user_subtitle: prompt.user_subtitle || undefined,
        prompt: prompt.prompt || undefined,
        section: prompt.section || undefined,
        context: prompt.context || undefined
      }));

      console.log("===== PROCESSED PROMPTS =====", processedPrompts);
      
      // Set all prompts for display
      setPrompts(processedPrompts);
      console.log(`Retrieved ${processedPrompts.length} prompts from database`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error fetching prompts:", errorMessage);
      setError(errorMessage);
      toast.error("Failed to load prompts");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPrompts();
  };

  // Function to view raw database structure for debugging
  const viewRawData = () => {
    console.log("Raw Database Data:", rawData);
    toast.info("Raw data logged to console. Press F12 to view.");
  };

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
            <AlertTriangle className="h-8 w-8 text-[#FFC49A] mb-2" />
            <div className="text-[#E9E7E2]/70 mb-2">Error loading prompts</div>
            <div className="text-[#E9E7E2]/50 text-sm max-w-lg text-center mb-4">{error}</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="ghost" 
                className="text-[#CCFF23] hover:text-[#CCFF23]/90 flex items-center gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Refreshing..." : "Refresh Prompts"}
              </Button>
              <Button 
                variant="ghost" 
                className="text-[#E9E7E2]/70 hover:text-[#E9E7E2] flex items-center gap-2"
                onClick={viewRawData}
              >
                <Database className="h-4 w-4" />
                View Raw Data
              </Button>
            </div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex justify-center items-center h-full flex-col">
            <AlertTriangle className="h-8 w-8 text-[#FFC49A] mb-2" />
            <div className="text-[#E9E7E2]/70 mb-2">No prompts available</div>
            <div className="text-[#E9E7E2]/50 text-sm text-center max-w-md mb-4">
              {rawData.length > 0 
                ? "Found data in the database but couldn't process it correctly. Check the browser console for details."
                : "No prompts found in the database. Make sure prompts are properly configured in the 'prompts' table."}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="ghost" 
                className="text-[#CCFF23] hover:text-[#CCFF23]/90 flex items-center gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Refreshing..." : "Refresh Prompts"}
              </Button>
              <Button 
                variant="ghost" 
                className="text-[#E9E7E2]/70 hover:text-[#E9E7E2] flex items-center gap-2"
                onClick={viewRawData}
              >
                <Database className="h-4 w-4" />
                View Raw Data
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-[#E9E7E2]/70">
                Found {prompts.length} prompts
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#E9E7E2]/70 hover:text-[#E9E7E2] flex items-center gap-2"
                onClick={viewRawData}
              >
                <Database className="h-4 w-4" />
                Debug
              </Button>
            </div>
            {viewMode === "grid" ? (
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
          </>
        )}
      </main>
    </div>
  );
};

export default VirgilPrompts;
