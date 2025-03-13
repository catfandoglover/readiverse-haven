
import React, { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Book, Users, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import ClassicsList from "./favorites/ClassicsList";
import IconsList from "./favorites/IconsList";
import ConceptsList from "./favorites/ConceptsList";

type FavoritesTabType = "classics" | "icons" | "concepts";

const FavoritesContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FavoritesTabType>("classics");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-6 mb-4 border-b border-[#2A282A]/10 pb-2">
        <button
          className={cn(
            "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
            activeTab === "classics"
              ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
              : "text-[#2A282A]/60"
          )}
          onClick={() => setActiveTab("classics")}
        >
          <Book className="h-3 w-3" />
          CLASSICS
        </button>
        <button
          className={cn(
            "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
            activeTab === "icons"
              ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
              : "text-[#2A282A]/60"
          )}
          onClick={() => setActiveTab("icons")}
        >
          <Users className="h-3 w-3" />
          ICONS
        </button>
        <button
          className={cn(
            "flex items-center gap-2 py-2 relative whitespace-nowrap uppercase font-oxanium text-xs",
            activeTab === "concepts"
              ? "text-[#2A282A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#9b87f5]"
              : "text-[#2A282A]/60"
          )}
          onClick={() => setActiveTab("concepts")}
        >
          <Brain className="h-3 w-3" />
          CONCEPTS
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "classics" && <ClassicsList />}
        {activeTab === "icons" && <IconsList />}
        {activeTab === "concepts" && <ConceptsList />}
      </ScrollArea>
    </div>
  );
};

export default FavoritesContent;
