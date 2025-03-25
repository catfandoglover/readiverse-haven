
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Item {
  id: string;
  title?: string;
  name?: string;
  question?: string;
  image?: string;
  illustration?: string;
}

interface ContentCarouselProps {
  title: string;
  items: Item[];
  type: "questions" | "classics" | "icons" | "concepts";
  onItemClick?: (item: Item) => void;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  items,
  type,
  onItemClick,
}) => {
  const navigate = useNavigate();
  
  // If there are no items, don't render anything
  if (!items || items.length === 0) return null;

  const handleViewAll = () => {
    switch (type) {
      case "questions":
        navigate("/discover/search/questions");
        break;
      case "classics":
        navigate("/discover/search/classics");
        break;
      case "icons":
        navigate("/discover/search/icons");
        break;
      case "concepts":
        navigate("/discover/search/concepts");
        break;
    }
  };

  const handleItemClick = (item: Item) => {
    if (onItemClick) {
      onItemClick(item);
      return;
    }
    
    let viewType: string;
    let itemId = item.id;
    
    switch (type) {
      case "questions":
        viewType = "question";
        break;
      case "classics":
        viewType = "classic";
        break;
      case "icons":
        viewType = "icon";
        break;
      case "concepts":
        viewType = "concept";
        break;
      default:
        viewType = "classic";
    }
    
    navigate(`/view/${viewType}/${itemId}`);
  };

  const getItemTitle = (item: Item): string => {
    if (type === "questions" && item.question) {
      return item.question;
    } else if (type === "icons" && item.name) {
      return item.name;
    } else {
      return item.title || "";
    }
  };

  const getItemImage = (item: Item): string => {
    if (type === "questions" || type === "concepts" || type === "icons") {
      return item.illustration || "";
    } else {
      return item.image || "";
    }
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg uppercase font-bold">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
          onClick={handleViewAll}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex space-x-4">
          {items.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="w-32 flex-none cursor-pointer group"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative h-44 w-32 rounded-md overflow-hidden mb-2">
                <img
                  src={getItemImage(item)}
                  alt={getItemTitle(item)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h4 
                className={cn(
                  "text-sm font-oxanium uppercase line-clamp-2 group-hover:text-[#9b87f5] transition-colors",
                  type === "classics" ? "text-white" : "text-[#2A282A]"
                )}
              >
                {getItemTitle(item)}
              </h4>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContentCarousel;
