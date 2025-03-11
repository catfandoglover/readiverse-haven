
import React, { useEffect } from "react";
import { ArrowLeft, BookOpen, Plus, ShoppingCart } from "lucide-react";
import ContentCarousel from "./ContentCarousel";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";

interface DetailedViewProps {
  type: "icon" | "concept" | "classic";
  data: any;
  onBack?: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({
  type,
  data,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent body scrolling when DetailedView is mounted
  useEffect(() => {
    // Save the original overflow style
    const originalStyle = document.body.style.overflow;
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';

    // Restore original style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Use browser history to go back if possible
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback to main discover view
        navigate('/');
      }
    }
  };

  const renderHeader = () => (
    <div className="flex items-center h-12 px-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
      <button onClick={handleBack} className="h-8 w-8 rounded-md flex items-center justify-center bg-black/50 text-white">
        <ArrowLeft className="h-5 w-5" />
      </button>
    </div>
  );

  // Bottom navigation bar similar to BottomNav but with READ, ADD, ORDER buttons
  const renderClassicBottomNav = () => (
    <div className="bg-[#2A282A] border-t border-gray-700 fixed bottom-0 left-0 right-0 z-10" style={{ height: "50px" }}>
      <div className="flex justify-center items-center h-full">
        <div className="flex justify-center items-center w-full max-w-xs">
          <button 
            className="flex flex-col items-center justify-center w-1/3 gap-0.5 text-[#E9E7E2]"
            onClick={() => data.onReadNow && data.onReadNow()}
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-[10px] uppercase font-oxanium">Read</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center w-1/3 gap-0.5 text-[#E9E7E2]"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] uppercase font-oxanium">Add</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center w-1/3 gap-0.5 text-[#E9E7E2]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-[10px] uppercase font-oxanium">Order</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#2A282A] text-[#E9E7E2] flex flex-col">
      {/* Header (fixed position) */}
      {renderHeader()}
      
      {/* Content area that takes full height minus header height and bottom nav */}
      <div className="h-full pt-12 pb-[50px] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Cover Image - fixed aspect ratio */}
          <div className="w-full aspect-square relative">
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <h1 className="text-4xl font-serif mb-2">{data.title}</h1>
            {type === "classic" && <h2 className="text-xl font-serif mb-6 text-gray-400">
                by {data.author}
              </h2>}

            {type === "classic" && <p className="text-xl font-medium mb-8">
                {data.tagline || "What lies beneath the morality you hold sacred?"}
              </p>}

            <div className="mb-8">
              <h3 className="text-lg uppercase font-bold mb-3">ABOUT</h3>
              <p className="text-gray-300">{data.about}</p>
            </div>

            {(type === "icon" || type === "classic" || type === "concept") && <div className="mb-8">
                <h3 className="text-lg uppercase font-bold mb-3">
                  GREAT CONVERSATION
                </h3>
                <p className="text-gray-300">{data.great_conversation}</p>
              </div>}

            {type === "concept" && <div className="mb-8">
                <h3 className="text-lg uppercase font-bold mb-3">GENEALOGY</h3>
                <p className="text-gray-300">{data.genealogy}</p>
              </div>}

            {type === "icon" && data.anecdotes && <div className="mb-8">
                <h3 className="text-lg uppercase font-bold mb-3">ANECDOTES</h3>
                <p className="text-gray-300">{data.anecdotes}</p>
              </div>}

            {/* Connected Content Carousels */}
            <ContentCarousel title="RELATED GREAT QUESTIONS" items={data.related_questions || []} type="questions" />

            <ContentCarousel title="RELATED CLASSICS" items={data.related_classics || []} type="classics" />

            <ContentCarousel title="RELATED ICONS" items={data.related_icons || []} type="icons" />

            <ContentCarousel title="RELATED CONCEPTS" items={data.related_concepts || []} type="concepts" />
          </div>
        </div>
      </div>

      {/* Bottom navigation for classics only */}
      {type === "classic" && renderClassicBottomNav()}
    </div>
  );
};

export default DetailedView;
