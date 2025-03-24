
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
  // Log prompt data for debugging
  console.log("PromptCard rendering with data:", prompt);
  
  // Default values for missing fields
  const title = prompt.user_title || "Untitled Prompt";
  const section = prompt.section || "intellectual";
  const sectionColor = getSectionColor(section);
  const icon = prompt.icon_display || "💭";
  
  if (viewMode === "list") {
    return (
      <div 
        className="flex items-center bg-[#4A4351]/50 rounded-xl p-4 cursor-pointer hover:bg-[#4A4351] transition-colors"
        onClick={onSelect}
      >
        <div 
          className="w-10 h-10 flex items-center justify-center rounded-full mr-4"
          style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-baskerville text-lg text-[#E9E7E2]">{title}</h3>
          {prompt.user_subtitle && (
            <p className="text-sm text-[#E9E7E2]/70 mt-1 line-clamp-1">{prompt.user_subtitle}</p>
          )}
        </div>
        <ArrowRight className="h-5 w-5 text-[#E9E7E2]/50" />
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
        {icon}
      </div>
      <h3 className="font-baskerville text-xl text-[#E9E7E2] mb-2">{title}</h3>
      {prompt.user_subtitle && (
        <p className="text-sm text-[#E9E7E2]/70 flex-1 line-clamp-2">{prompt.user_subtitle}</p>
      )}
      <div className="flex items-center justify-end mt-4">
        <ArrowRight className="h-5 w-5 text-[#E9E7E2]/50" />
      </div>
    </div>
  );
};

export default PromptCard;
