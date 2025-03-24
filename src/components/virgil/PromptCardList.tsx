
import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Brain, Wrench, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptCardListProps {
  prompt: {
    id: number;
    user_title: string;
    user_subtitle: string;
    section: string;
  };
}

const PromptCardList: React.FC<PromptCardListProps> = ({ prompt }) => {
  const navigate = useNavigate();

  const getSectionColor = (section: string) => {
    switch (section.toLowerCase()) {
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

  const getSectionIcon = (section: string) => {
    const color = getSectionColor(section);
    
    switch (section.toLowerCase()) {
      case "emotional":
        return <Heart className="h-5 w-5" style={{ color }} />;
      case "intellectual":
        return <Brain className="h-5 w-5" style={{ color }} />;
      case "practical":
        return <Wrench className="h-5 w-5" style={{ color }} />;
      default:
        return <Brain className="h-5 w-5" style={{ color }} />;
    }
  };

  const handleClick = () => {
    navigate(`/virgil-chat/${prompt.id}`);
  };

  return (
    <div
      className="bg-[#221F26] rounded-xl p-4 hover:bg-[#2A282A] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="mr-3">
          {getSectionIcon(prompt.section)}
        </div>
        <div className="flex-1">
          <h3 className="font-baskervville text-[#E9E7E2] text-base">
            {prompt.user_title}
          </h3>
          <p className="text-[#E9E7E2]/70 text-xs">
            {prompt.user_subtitle}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-[#E9E7E2]/50" />
      </div>
    </div>
  );
};

export default PromptCardList;
