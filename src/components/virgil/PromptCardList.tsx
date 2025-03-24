
import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Brain, Wrench, ChevronRight } from "lucide-react";

interface PromptCardListProps {
  prompt: {
    id: number;
    user_title?: string;
    user_subtitle?: string;
    section?: string;
    prompt?: string;
    context?: string;
  };
}

const PromptCardList: React.FC<PromptCardListProps> = ({ prompt }) => {
  const navigate = useNavigate();
  console.log("Rendering PromptCardList with prompt:", prompt);

  const getSectionColor = (section: string | undefined) => {
    switch ((section || "").toLowerCase()) {
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

  const getSectionIcon = (section: string | undefined) => {
    const color = getSectionColor(section);
    
    switch ((section || "").toLowerCase()) {
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
    if (!prompt || !prompt.id) {
      console.error("Cannot navigate, prompt or prompt.id is missing:", prompt);
      return;
    }
    console.log("List item clicked, navigating to:", `/virgil-chat/${prompt.id}`);
    navigate(`/virgil-chat/${prompt.id}`);
  };

  // If the prompt object is invalid, render a placeholder with an error style
  if (!prompt || typeof prompt !== 'object' || !prompt.id) {
    console.error("Invalid prompt object:", prompt);
    return (
      <div className="bg-[#221F26] rounded-xl p-4 border border-red-500">
        <div className="flex items-center">
          <div className="mr-3">
            <Brain className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-baskervville text-red-400 text-base">
              Error: Invalid Prompt
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // Get display values with fallbacks
  const displayTitle = prompt.user_title || prompt.prompt?.substring(0, 30) || "Untitled Prompt";
  const displaySubtitle = prompt.user_subtitle || prompt.context || "No description available";
  const displaySection = prompt.section || "intellectual";

  return (
    <div
      className="bg-[#221F26] rounded-xl p-4 hover:bg-[#2A282A] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="mr-3">
          {getSectionIcon(displaySection)}
        </div>
        <div className="flex-1">
          <h3 className="font-baskervville text-[#E9E7E2] text-base">
            {displayTitle}
          </h3>
          <p className="text-[#E9E7E2]/70 text-xs">
            {displaySubtitle}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-[#E9E7E2]/50" />
      </div>
    </div>
  );
};

export default PromptCardList;
