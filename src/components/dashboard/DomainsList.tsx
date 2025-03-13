
import React from "react";
import DomainCard from "./DomainCard";
import { Book, Heart, Globe, Sparkles, Diamond, Palette } from "lucide-react";

const DomainsList: React.FC = () => {
  const domains = [
    {
      id: "ethics",
      title: "Ethics",
      description: "Explore frameworks for understanding right and wrong, good and evil, virtue and vice.",
      icon: <Heart className="h-5 w-5" />,
      progress: 21,
      color: "#FD8F8F"
    },
    {
      id: "epistemology",
      title: "Epistemology",
      description: "Examine the nature of knowledge, belief, and the foundations of understanding.",
      icon: <Diamond className="h-5 w-5" />,
      progress: 15,
      color: "#7E69AB"
    },
    {
      id: "politics",
      title: "Politics",
      description: "Understand the systems and theories that govern societies and shape our collective decisions.",
      icon: <Globe className="h-5 w-5" />,
      progress: 18,
      color: "#b29eff"
    },
    {
      id: "theology",
      title: "Theology",
      description: "Examine the nature of the divine and religious belief systems throughout history.",
      icon: <Sparkles className="h-5 w-5" />,
      progress: 35,
      color: "#EFFE91"
    },
    {
      id: "ontology",
      title: "Ontology",
      description: "Investigate the nature of being, reality, and existence itself.",
      icon: <Diamond className="h-5 w-5" />,
      progress: 12,
      color: "#8DD7CF"
    },
    {
      id: "aesthetics",
      title: "Aesthetics",
      description: "Study beauty, art, taste, and the nature of creative expression.",
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
