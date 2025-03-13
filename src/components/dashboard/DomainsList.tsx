
import React from "react";
import DomainCard from "./DomainCard";
import { Heart, Diamond, Globe, Sparkles, Palette } from "lucide-react";

const DomainsList: React.FC = () => {
  const domains = [
    {
      id: "ethics",
      title: "Ethics",
      description: "YOUR VIEW ON THE GOOD",
      icon: <Heart className="h-5 w-5" />,
      progress: 21,
      color: "#FD8F8F"
    },
    {
      id: "epistemology",
      title: "Epistemology",
      description: "YOUR VIEW ON KNOWLEDGE",
      icon: <Diamond className="h-5 w-5" />,
      progress: 15,
      color: "#7E69AB"
    },
    {
      id: "politics",
      title: "Politics",
      description: "YOUR VIEW ON POWER",
      icon: <Globe className="h-5 w-5" />,
      progress: 18,
      color: "#b29eff"
    },
    {
      id: "theology",
      title: "Theology",
      description: "YOUR VIEW ON THE DIVINE",
      icon: <Sparkles className="h-5 w-5" />,
      progress: 35,
      color: "#EFFE91"
    },
    {
      id: "ontology",
      title: "Ontology",
      description: "YOUR VIEW ON REALITY",
      icon: <Diamond className="h-5 w-5" />,
      progress: 12,
      color: "#8DD7CF"
    },
    {
      id: "aesthetics",
      title: "Aesthetics",
      description: "YOUR VIEW ON BEAUTY",
      icon: <Palette className="h-5 w-5" />,
      progress: 28,
      color: "#D3E4FD"
    }
  ];

  return (
    <div className="space-y-2">
      {domains.map((domain) => (
        <DomainCard 
          key={domain.id}
          id={domain.id}
          title={domain.title}
          description={domain.description}
          icon={domain.icon}
          progress={domain.progress}
          color={domain.color}
        />
      ))}
    </div>
  );
};

export default DomainsList;
