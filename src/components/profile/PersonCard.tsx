import React from "react";

interface PersonCardProps {
  name: string;
  classic?: string;
  rationale?: string;
  imageUrl: string;
  domain: string;
  type: "KINDRED SPIRIT" | "CHALLENGING VOICE";
  onClick: () => void;
  showNameOverlay?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  name,
  classic,
  rationale,
  imageUrl,
  domain,
  type,
  onClick,
  showNameOverlay = false,
}) => {
  const fallbackImageUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8";
  
  // Determine background color based on type
  const typeBgColorClass = type === "KINDRED SPIRIT" 
    ? "bg-[#1D3A35]/90" 
    : "bg-[#301630]/90";

  // Special handling for MOST domain
  const isMost = domain === "MOST";
  
  // Uppercase domain for display
  const domainDisplay = domain.toUpperCase();
  
  // Special label for MOST records
  const displayType = isMost ? `MOST ${type}` : type;

  return (
    <div 
      onClick={onClick}
      className="w-full h-full group relative cursor-pointer"
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
        <img
          src={imageUrl || fallbackImageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallbackImageUrl;
          }}
        />
        
        {/* Domain indicator */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {/* Only show domain indicator if not MOST */}
          {!isMost && (
            <div className="rounded-2xl px-3 py-1 backdrop-blur-sm bg-[#383741]/80 flex justify-center items-center">
              <span className="font-oxanium uppercase italic text-[10px] tracking-tight text-white whitespace-nowrap text-center">
                {domainDisplay}
              </span>
            </div>
          )}
          
          {/* Type indicator - always show */}
          <div className={`rounded-2xl px-3 py-1 backdrop-blur-sm ${typeBgColorClass} flex justify-center items-center`}>
            <span className="font-oxanium italic uppercase text-[10px] tracking-tight text-white whitespace-nowrap text-center">
              {displayType}
            </span>
          </div>
        </div>
        
        {/* Icon name overlay - shown for MOST items or when using icon as fallback */}
        {showNameOverlay && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="font-oxanium uppercase italic text-[16px] tracking-tight text-white text-shadow drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] font-medium break-words leading-tight block">
              {name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonCard; 