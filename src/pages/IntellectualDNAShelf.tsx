
import React from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import EthicsContent from "@/components/bookshelf/domains/EthicsContent";
import EpistemologyContent from "@/components/bookshelf/domains/EpistemologyContent";
import PoliticsContent from "@/components/bookshelf/domains/PoliticsContent";
import TheologyContent from "@/components/bookshelf/domains/TheologyContent";
import OntologyContent from "@/components/bookshelf/domains/OntologyContent";
import AestheticsContent from "@/components/bookshelf/domains/AestheticsContent";
import MainMenu from "@/components/navigation/MainMenu";

const IntellectualDNAShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate("/bookshelf");
  };

  const handleFavoritesClick = () => {
    navigate("/favorites-shelf");
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 pb-12 px-8 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          INTELLECTUAL DNA SHELF
        </h2>
        <button 
          onClick={handleFavoritesClick}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#4A4351]/50"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      
      {/* Main Content - using overflow-auto directly */}
      <div className="flex-1 overflow-auto pb-20 px-4">
        {/* Ethics */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-libre-baskerville text-base font-bold text-[#E9E7E2]">
              ETHICS
            </h2>
            <p className="font-baskerville text-[#E9E7E2]/50 text-base">
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
            <p className="font-baskerville text-[#E9E7E2]/50 text-base">
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
            <p className="font-baskerville text-[#E9E7E2]/50 text-base">
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
            <p className="font-baskerville text-[#E9E7E2]/50 text-base">
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
            <p className="font-baskerville text-[#E9E7E2]/50 text-base">
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
            <p className="font-baskerville text-[#E9E7E2]/50 text-base">
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
