
import React, { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import EthicsContent from "./domains/EthicsContent";
import EpistemologyContent from "./domains/EpistemologyContent";
import PoliticsContent from "./domains/PoliticsContent";
import TheologyContent from "./domains/TheologyContent";
import OntologyContent from "./domains/OntologyContent";
import AestheticsContent from "./domains/AestheticsContent";

type DomainTabType = "ethics" | "epistemology" | "politics" | "theology" | "ontology" | "aesthetics";

const BookshelfContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DomainTabType>("ethics");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 border-b border-[#2A282A]/10 pb-2 overflow-x-auto">
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
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "ethics" && <EthicsContent />}
        {activeTab === "epistemology" && <EpistemologyContent />}
        {activeTab === "politics" && <PoliticsContent />}
        {activeTab === "theology" && <TheologyContent />}
        {activeTab === "ontology" && <OntologyContent />}
        {activeTab === "aesthetics" && <AestheticsContent />}
      </ScrollArea>
    </div>
  );
};

export default BookshelfContent;
