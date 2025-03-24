
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

// Helper function to convert database icon name to correct Lucide icon
const getLucideIcon = (iconName: string): LucideIcon => {
  // Default fallback icon
  let Icon: LucideIcon = LucideIcons.FileText;
  
  if (!iconName) return Icon;
  
  try {
    // Try direct access first (in case it's already correct case)
    if (LucideIcons[iconName as keyof typeof LucideIcons]) {
      return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
    }
    
    // Try converting first character to uppercase (for PascalCase)
    const pascalCase = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    if (LucideIcons[pascalCase as keyof typeof LucideIcons]) {
      return LucideIcons[pascalCase as keyof typeof LucideIcons] as LucideIcon;
    }
    
    // Try kebab-case to PascalCase conversion (e.g., "file-text" to "FileText")
    if (iconName.includes('-')) {
      const pascalFromKebab = iconName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      if (LucideIcons[pascalFromKebab as keyof typeof LucideIcons]) {
        return LucideIcons[pascalFromKebab as keyof typeof LucideIcons] as LucideIcon;
      }
    }
    
    console.log(`Icon not found: ${iconName}, using default FileText icon`);
  } catch (error) {
    console.error(`Error processing icon: ${iconName}`, error);
  }
  
  // Fallback to FileText if no match or error
  return Icon;
};

const PromptCard: React.FC<PromptCardProps> = ({ prompt, viewMode, onSelect }) => {
  const sectionColor = getSectionColor(prompt.section);
  const isMobile = useIsMobile();
  
  // Get the Lucide icon component with our enhanced conversion function
  const IconComponent = getLucideIcon(prompt.icon_display || "");
  
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
      <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
        {prompt.user_title}
      </h3>
      {prompt.user_subtitle && (
        <p className="text-sm text-[#E9E7E2]/70">
          {prompt.user_subtitle}
        </p>
      )}
      
      {/* Spacer to push the section label to the bottom */}
      <div className="flex-grow"></div>
      
      {/* Section label at bottom left */}
      {prompt.section && (
        <div className="mt-4">
          <p className="uppercase text-xs tracking-wider opacity-70">
            {prompt.section}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptCard;
