
import React from "react";
import { ArrowLeft } from "lucide-react";
import ContentCarousel from "./ContentCarousel";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useLocation } from "react-router-dom";

interface DetailedViewProps {
  type: "icon" | "concept" | "classic";
  data: any;
  onBack?: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({ type, data, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // If coming from a direct URL, go back to the main discover view
      navigate('/');
    }
  };

  const renderHeader = () => (
    <div className="flex items-center h-14 px-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
      <button
        onClick={handleBack}
        className="h-10 w-10 rounded-md flex items-center justify-center bg-black/50 text-white"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    </div>
  );

  const renderClassicButtons = () => (
    <div className="flex justify-between bg-[#2A282A] p-4 border-t border-gray-700">
      <Button
        className="flex-1 mr-2 bg-transparent border border-[#9b87f5] text-white hover:bg-[#9b87f5]/20"
      >
        <span className="mr-2">📖</span> READ NOW
      </Button>
      <Button
        className="flex-1 mx-2 bg-transparent border border-[#9b87f5] text-white hover:bg-[#9b87f5]/20"
      >
        <span className="mr-2">+</span> ADD TO STUDY
      </Button>
      <Button
        className="flex-1 ml-2 bg-transparent border border-[#9b87f5] text-white hover:bg-[#9b87f5]/20"
      >
        <span className="mr-2">🛒</span> ORDER
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#2A282A] text-[#E9E7E2] overflow-auto">
      <div className="relative">
        {/* Cover Image */}
        <div className="h-[60vh] relative">
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-full object-cover"
          />
          {renderHeader()}
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <h1 className="text-4xl font-serif mb-2">{data.title}</h1>
          {type === "classic" && (
            <h2 className="text-xl font-serif mb-6 text-gray-400">
              by {data.author}
            </h2>
          )}

          {type === "classic" && (
            <p className="text-xl font-medium mb-8">
              {data.tagline || "What lies beneath the morality you hold sacred?"}
            </p>
          )}

          <div className="mb-8">
            <h3 className="text-lg uppercase font-bold mb-3">ABOUT</h3>
            <p className="text-gray-300">{data.about}</p>
          </div>

          {(type === "icon" || type === "classic" || type === "concept") && (
            <div className="mb-8">
              <h3 className="text-lg uppercase font-bold mb-3">
                GREAT CONVERSATION
              </h3>
              <p className="text-gray-300">{data.great_conversation}</p>
            </div>
          )}

          {type === "concept" && (
            <div className="mb-8">
              <h3 className="text-lg uppercase font-bold mb-3">GENEALOGY</h3>
              <p className="text-gray-300">{data.genealogy}</p>
            </div>
          )}

          {type === "icon" && data.anecdotes && (
            <div className="mb-8">
              <h3 className="text-lg uppercase font-bold mb-3">ANECDOTES</h3>
              <p className="text-gray-300">{data.anecdotes}</p>
            </div>
          )}

          {/* Connected Content Carousels */}
          <ContentCarousel
            title="RELATED GREAT QUESTIONS"
            items={data.related_questions || []}
            type="questions"
          />

          <ContentCarousel
            title="RELATED CLASSICS"
            items={data.related_classics || []}
            type="classics"
          />

          <ContentCarousel
            title="RELATED ICONS"
            items={data.related_icons || []}
            type="icons"
          />

          <ContentCarousel
            title="RELATED CONCEPTS"
            items={data.related_concepts || []}
            type="concepts"
          />
        </div>
      </div>

      {type === "classic" && renderClassicButtons()}
    </div>
  );
};

export default DetailedView;
