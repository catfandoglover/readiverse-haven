
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import EthicsContent from "@/components/bookshelf/domains/EthicsContent";
import EpistemologyContent from "@/components/bookshelf/domains/EpistemologyContent";
import PoliticsContent from "@/components/bookshelf/domains/PoliticsContent";
import TheologyContent from "@/components/bookshelf/domains/TheologyContent";
import OntologyContent from "@/components/bookshelf/domains/OntologyContent";
import AestheticsContent from "@/components/bookshelf/domains/AestheticsContent";

const IntellectualDNAShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate("/bookshelf");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#332E38] text-[#E9E7E2]">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button 
          onClick={handleBack}
          className="text-[#E9E7E2] p-2 rounded-full hover:bg-[#4A4351]/50"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-baskerville text-2xl ml-4">Intellectual DNA</h1>
      </div>
      
      {/* Main Content */}
      <ScrollArea className="flex-1 px-4 pb-20">
        {/* Ethics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2]">
              ETHICS
            </h2>
            <p className="font-oxanium text-[#E9E7E2]/50 text-base">
              Your view on the good
            </p>
          </div>
          <EthicsContent />
        </div>
        
        {/* Epistemology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2]">
              EPISTEMOLOGY
            </h2>
            <p className="font-oxanium text-[#E9E7E2]/50 text-base">
              Your view on knowledge
            </p>
          </div>
          <EpistemologyContent />
        </div>
        
        {/* Politics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2]">
              POLITICS
            </h2>
            <p className="font-oxanium text-[#E9E7E2]/50 text-base">
              Your view on power
            </p>
          </div>
          <PoliticsContent />
        </div>
        
        {/* Theology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2]">
              THEOLOGY
            </h2>
            <p className="font-oxanium text-[#E9E7E2]/50 text-base">
              Your view on the divine
            </p>
          </div>
          <TheologyContent />
        </div>
        
        {/* Ontology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2]">
              ONTOLOGY
            </h2>
            <p className="font-oxanium text-[#E9E7E2]/50 text-base">
              Your view on reality
            </p>
          </div>
          <OntologyContent />
        </div>
        
        {/* Aesthetics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2]">
              AESTHETICS
            </h2>
            <p className="font-oxanium text-[#E9E7E2]/50 text-base">
              Your view on beauty
            </p>
          </div>
          <AestheticsContent />
        </div>
      </ScrollArea>
    </div>
  );
};

export default IntellectualDNAShelf;
