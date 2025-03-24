
import React from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

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
  
  // Dynamically get the icon component from lucide-react
  const IconComponent = prompt.icon_display && LucideIcons[prompt.icon_display as keyof typeof LucideIcons] 
    ? LucideIcons[prompt.icon_display as keyof typeof LucideIcons] 
    : LucideIcons.FileText;
  
  if (viewMode === "list") {
    return (
      <div 
        className="flex items-center cursor-pointer py-3"
        onClick={onSelect}
      >
        <div 
          className="w-8 h-8 flex items-center justify-center rounded-full mr-4"
          style={{ color: sectionColor }}
        >
          <IconComponent size={18} />
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
      className="bg-[#4A4351]/50 rounded-xl p-6 cursor-pointer hover:bg-[#4A4351] transition-colors h-full flex flex-col"
      onClick={onSelect}
    >
      <div 
        className="w-12 h-12 flex items-center justify-center rounded-full mb-4"
        style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
      >
        <IconComponent size={24} />
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
