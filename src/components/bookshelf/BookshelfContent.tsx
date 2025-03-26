import React, { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { supabase } from "@/integrations/supabase/client";
import AllBooksContent from "./domains/AllBooksContent";
import EthicsContent from "./domains/EthicsContent";
import EpistemologyContent from "./domains/EpistemologyContent";
import PoliticsContent from "./domains/PoliticsContent";
import TheologyContent from "./domains/TheologyContent";
import OntologyContent from "./domains/OntologyContent";
import AestheticsContent from "./domains/AestheticsContent";
import CustomDomainContent from "./domains/CustomDomainContent";
import NewDomainDialog from "./NewDomainDialog";

type StandardDomainTabType = "all" | "ethics" | "epistemology" | "politics" | "theology" | "ontology" | "aesthetics";
type DomainTabType = StandardDomainTabType | string;

interface CustomDomain {
  id: string;
  name: string;
}

const BookshelfContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DomainTabType>("all");
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [isNewDomainDialogOpen, setIsNewDomainDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: fetchedCustomDomains, refetch: refetchCustomDomains } = useQuery({
    queryKey: ["custom-domains", user?.Account?.Uid],
    queryFn: async () => {
      if (!user || !user.Account?.Uid) return [];

      try {
        // Use the outseta_user_id directly from the user object
        const outsetaUserId = user.Account.Uid;
        
        // Query using outseta_user_id instead of user_id
        // Using "any" type assertion until proper types are generated
        const { data, error } = await (supabase as any)
          .from("custom_domains")
          .select("id, name")
          .eq("outseta_user_id", outsetaUserId)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching custom domains:", error);
          return [];
        }
        
        // Cast the data to the expected type
        return (data || []) as CustomDomain[];
      } catch (error) {
        console.error("Exception fetching custom domains:", error);
        return [];
      }
    },
    enabled: !!user && !!user.Account?.Uid,
  });

  useEffect(() => {
    if (fetchedCustomDomains) {
      // Cast the data to the expected type
      setCustomDomains(fetchedCustomDomains as CustomDomain[]);
    }
  }, [fetchedCustomDomains]);

  const handleNewDomainCreated = (domain: CustomDomain) => {
    refetchCustomDomains();
    setActiveTab(domain.id);
  };

  const handleNewDomainClick = () => {
    setIsNewDomainDialogOpen(true);
  };

  const isCustomDomain = () => {
    return !["all", "ethics", "epistemology", "politics", "theology", "ontology", "aesthetics"].includes(activeTab);
  };

  const currentCustomDomain = customDomains.find(domain => domain.id === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced tab menu with smooth scroll behavior */}
      <ScrollArea 
        className="w-full mb-4 pb-2"
        orientation="horizontal"
        enableDragging={true}
      >
        <div className="flex items-center gap-4 min-w-max pb-1 px-1">
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "all"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("all")}
          >
            ALL
          </button>
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "ethics"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("ethics")}
          >
            ETHICS
          </button>
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "epistemology"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("epistemology")}
          >
            EPISTEMOLOGY
          </button>
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "politics"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("politics")}
          >
            POLITICS
          </button>
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "theology"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("theology")}
          >
            THEOLOGY
          </button>
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "ontology"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("ontology")}
          >
            ONTOLOGY
          </button>
          <button
            className={cn(
              "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
              activeTab === "aesthetics"
                ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                : "text-[#2A282A]/60"
            )}
            onClick={() => setActiveTab("aesthetics")}
          >
            AESTHETICS
          </button>
          
          {customDomains.map((domain) => (
            <button
              key={domain.id}
              className={cn(
                "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
                activeTab === domain.id
                  ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
                  : "text-[#2A282A]/60"
              )}
              onClick={() => setActiveTab(domain.id)}
            >
              {domain.name.toUpperCase()}
            </button>
          ))}
          
          <button
            className="flex items-center gap-1 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs text-[#2A282A]/60 hover:text-[#2A282A]"
            onClick={handleNewDomainClick}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="inline-flex items-center">NEW SHELF</span>
          </button>
        </div>
      </ScrollArea>

      <ScrollArea className="flex-1">
        {activeTab === "all" && <AllBooksContent />}
        {activeTab === "ethics" && <EthicsContent />}
        {activeTab === "epistemology" && <EpistemologyContent />}
        {activeTab === "politics" && <PoliticsContent />}
        {activeTab === "theology" && <TheologyContent />}
        {activeTab === "ontology" && <OntologyContent />}
        {activeTab === "aesthetics" && <AestheticsContent />}
        
        {isCustomDomain() && currentCustomDomain && (
          <CustomDomainContent 
            domainId={currentCustomDomain.id} 
            domainName={currentCustomDomain.name} 
          />
        )}
      </ScrollArea>

      <NewDomainDialog 
        open={isNewDomainDialogOpen} 
        onOpenChange={setIsNewDomainDialogOpen} 
        onDomainCreated={handleNewDomainCreated}
      />
    </div>
  );
};

export default BookshelfContent;
