
import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Brain, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: {
    id: number;
    user_title: string;
    user_subtitle: string;
    section: string;
  };
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
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
        return <Heart className="h-6 w-6" style={{ color }} />;
      case "intellectual":
        return <Brain className="h-6 w-6" style={{ color }} />;
      case "practical":
        return <Wrench className="h-6 w-6" style={{ color }} />;
      default:
        return <Brain className="h-6 w-6" style={{ color }} />;
    }
  };

  const handleClick = () => {
    navigate(`/virgil-chat/${prompt.id}`);
  };

  return (
    <div
      className="bg-[#221F26] rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-center mb-3">
          {getSectionIcon(prompt.section)}
        </div>
        <h3 className="font-baskervville text-center text-[#E9E7E2] mb-1 text-base md:text-lg">
          {prompt.user_title}
        </h3>
        <p className="text-center text-[#E9E7E2]/70 text-xs md:text-sm">
          {prompt.user_subtitle}
        </p>
      </div>
    </div>
  );
};

export default PromptCard;
