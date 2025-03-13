
import React from "react";
import DomainCard from "./DomainCard";
import { Book, Heart, Globe, FileText, Landmark, Sparkles } from "lucide-react";

const DomainsList: React.FC = () => {
  const domains = [
    {
      id: "philosophy",
      title: "Philosophy",
      description: "Explore the fundamental questions of existence, knowledge, values, reason, mind, and language.",
      icon: <Landmark className="h-5 w-5" />,
      progress: 42,
      color: "#9b87f5"
    },
    {
      id: "literature",
      title: "Literature",
      description: "Discover the great works that have shaped human thought and culture through storytelling.",
      icon: <Book className="h-5 w-5" />,
      progress: 28,
      color: "#7E69AB"
    },
    {
      id: "politics",
      title: "Politics",
      description: "Understand the systems and theories that govern societies and shape our collective decisions.",
      icon: <Globe className="h-5 w-5" />,
      progress: 15,
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
      id: "ethics",
      title: "Ethics",
      description: "Explore frameworks for understanding right and wrong, good and evil, virtue and vice.",
      icon: <Heart className="h-5 w-5" />,
      progress: 21,
      color: "#FD8F8F"
    },
    {
      id: "history",
      title: "History",
      description: "Trace the development of human civilization and the forces that have shaped our world.",
      icon: <FileText className="h-5 w-5" />,
      progress: 48,
      color: "#8DD7CF"
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
