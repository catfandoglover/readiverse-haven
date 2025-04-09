import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import EthicsContent from "@/components/bookshelf/domains/EthicsContent";
import EpistemologyContent from "@/components/bookshelf/domains/EpistemologyContent";
import PoliticsContent from "@/components/bookshelf/domains/PoliticsContent";
import TheologyContent from "@/components/bookshelf/domains/TheologyContent";
import OntologyContent from "@/components/bookshelf/domains/OntologyContent";
import AestheticsContent from "@/components/bookshelf/domains/AestheticsContent";
import BackButton from "@/components/navigation/BackButton";

const IntellectualDNAShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate("/bookshelf");
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 px-4 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <BackButton />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          INTELLECTUAL DNA SHELF
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>
      
      {/* Main Content - using overflow-auto directly */}
      <div className="flex-1 overflow-auto pb-20 px-4 pt-6">
        {/* Ethics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              ETHICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on the good
            </p>
          </div>
          <EthicsContent />
        </div>
        
        {/* Epistemology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              EPISTEMOLOGY
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on knowledge
            </p>
          </div>
          <EpistemologyContent />
        </div>
        
        {/* Politics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              POLITICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on power
            </p>
          </div>
          <PoliticsContent />
        </div>
        
        {/* Theology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              THEOLOGY
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on the divine
            </p>
          </div>
          <TheologyContent />
        </div>
        
        {/* Ontology */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              ONTOLOGY
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
              Your view on reality
            </p>
          </div>
          <OntologyContent />
        </div>
        
        {/* Aesthetics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              AESTHETICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-lg">
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
