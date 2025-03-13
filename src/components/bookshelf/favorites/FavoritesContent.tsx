
import React, { useState } from "react";
import { Book, Users, Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClassicsList from "./ClassicsList";
import IconsList from "./IconsList";
import ConceptsList from "./ConceptsList";

type FavoritesTabType = "classics" | "icons" | "concepts";

const FavoritesContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FavoritesTabType>("classics");

  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#E9E7E2] border-b border-[#2A282A]/10 px-2">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          <TabButton 
            active={activeTab === "classics"} 
            onClick={() => setActiveTab("classics")}
            icon={<Book className="w-4 h-4 mr-1" />}
            label="Classics"
          />
          <TabButton 
            active={activeTab === "icons"} 
            onClick={() => setActiveTab("icons")}
            icon={<Users className="w-4 h-4 mr-1" />}
            label="Icons"
          />
          <TabButton 
            active={activeTab === "concepts"} 
            onClick={() => setActiveTab("concepts")}
            icon={<Brain className="w-4 h-4 mr-1" />}
            label="Concepts"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          {activeTab === "classics" && <ClassicsList />}
          {activeTab === "icons" && <IconsList />}
          {activeTab === "concepts" && <ConceptsList />}
        </div>
      </ScrollArea>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap transition-colors
      ${active 
        ? "bg-[#2A282A] text-[#E9E7E2]" 
        : "bg-[#E9E7E2] text-[#2A282A] hover:bg-[#2A282A]/10"
      }`}
  >
    {icon}
    {label}
  </button>
);

export default FavoritesContent;
