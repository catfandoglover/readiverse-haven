
import React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Prompt {
  id: string | number;
  user_title: string;
  section?: string;
  icon_display?: string;
  context?: string;
  user_subtitle?: string;
  initial_message?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  viewMode: "list" | "grid";
  onSelect: () => void;
}

const getSectionColor = (section: string = "intellectual"): string => {
  switch (section?.toLowerCase()) {
    case "emotional":
      return "#FFC49A";
    case "intellectual":
      return "#F9F9F9";
    case "practical":
      return "#D5B8FF";
    default:
      return "#F9F9F9";
  }
};

const PromptCard: React.FC<PromptCardProps> = ({ prompt, viewMode, onSelect }) => {
  const sectionColor = getSectionColor(prompt.section);
  const isMobile = useIsMobile();
  
  // Get the Lucide icon component safely
  let IconComponent: LucideIcon = LucideIcons.FileText;
  
  if (prompt.icon_display && typeof prompt.icon_display === 'string') {
    const iconName = prompt.icon_display as keyof typeof LucideIcons;
    if (LucideIcons[iconName] && typeof LucideIcons[iconName] === 'function') {
      IconComponent = LucideIcons[iconName] as LucideIcon;
    }
  }
  
  if (viewMode === "list") {
    return (
      <div 
        className={cn("flex items-center cursor-pointer", isMobile ? "py-2.5" : "py-3")}
        onClick={onSelect}
      >
        <div 
          className="flex items-center mr-4"
          style={{ color: sectionColor }}
        >
          <IconComponent size={isMobile ? 14 : 16} />
        </div>
        <div className="flex-1">
          <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold">
            {prompt.user_title}
          </h3>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn("bg-[#4A4351]/50 rounded-xl cursor-pointer hover:bg-[#4A4351] transition-colors h-full flex flex-col", 
        isMobile ? "p-5" : "p-6")}
      onClick={onSelect}
    >
      <div 
        className={cn("flex items-start mb-4", 
          isMobile ? "mb-3" : "")}
        style={{ color: sectionColor }}
      >
        <IconComponent size={isMobile ? 18 : 22} />
      </div>
      <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold">
        {prompt.user_title}
      </h3>
      {prompt.user_subtitle && (
        <p className="text-sm text-[#E9E7E2]/70 flex-1 line-clamp-2">{prompt.user_subtitle}</p>
      )}
    </div>
  );
};

export default PromptCard;
