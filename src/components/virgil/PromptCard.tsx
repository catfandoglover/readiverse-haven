
import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Brain, Wrench } from "lucide-react";

interface PromptCardProps {
  prompt: {
    id: number;
    user_title?: string;
    user_subtitle?: string;
    section?: string;
    prompt?: string;
    context?: string;
  };
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const navigate = useNavigate();
  console.log("Rendering PromptCard with prompt:", prompt);

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
    if (!prompt || !prompt.id) {
      console.error("Cannot navigate, prompt or prompt.id is missing:", prompt);
      return;
    }
    console.log("Card clicked, navigating to:", `/virgil-chat/${prompt.id}`);
    navigate(`/virgil-chat/${prompt.id}`);
  };

  // If the prompt object is invalid, render a placeholder with an error style
  if (!prompt || typeof prompt !== 'object' || !prompt.id) {
    console.error("Invalid prompt object:", prompt);
    return (
      <div className="bg-[#221F26] rounded-xl p-4 border border-red-500">
        <div className="flex flex-col h-full">
          <div className="flex justify-center mb-3">
            <Brain className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="font-baskervville text-center text-red-400 mb-1 text-base md:text-lg">
            Error: Invalid Prompt
          </h3>
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
      className="bg-[#221F26] rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-center mb-3">
          {getSectionIcon(displaySection)}
        </div>
        <h3 className="font-baskervville text-center text-[#E9E7E2] mb-1 text-base md:text-lg">
          {displayTitle}
        </h3>
        <p className="text-center text-[#E9E7E2]/70 text-xs md:text-sm">
          {displaySubtitle}
        </p>
      </div>
    </div>
  );
};

export default PromptCard;
