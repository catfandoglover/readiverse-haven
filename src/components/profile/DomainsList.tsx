
import React from "react";
import DomainCard from "./DomainCard";

const DomainsList: React.FC = () => {
  const domains = [
    {
      id: "ethics",
      title: "Ethics",
      description: "YOUR VIEW ON THE GOOD",
      progress: 21,
      color: "#FD8F8F"
    },
    {
      id: "epistemology",
      title: "Epistemology",
      description: "YOUR VIEW ON KNOWLEDGE",
      progress: 15,
      color: "#7E69AB"
    },
    {
      id: "politics",
      title: "Politics",
      description: "YOUR VIEW ON POWER",
      progress: 18,
      color: "#b29eff"
    },
    {
      id: "theology",
      title: "Theology",
      description: "YOUR VIEW ON THE DIVINE",
      progress: 35,
      color: "#EFFE91"
    },
    {
      id: "ontology",
      title: "Ontology",
      description: "YOUR VIEW ON REALITY",
      progress: 12,
      color: "#8DD7CF"
    },
    {
      id: "aesthetics",
      title: "Aesthetics",
      description: "YOUR VIEW ON BEAUTY",
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
          progress={domain.progress}
          color={domain.color}
        />
      ))}
    </div>
  );
};

export default DomainsList;
