
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
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 pb-4 px-8 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <button 
          onClick={handleBack}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#4A4351]/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          INTELLECTUAL DNA SHELF
        </h2>
        {/* Empty div to balance the layout */}
        <div className="w-10"></div>
      </div>
      
      {/* Main Content - using overflow-auto directly */}
      <div className="flex-1 overflow-auto pb-20 px-4">
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
        
        {/* Added extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default IntellectualDNAShelf;
