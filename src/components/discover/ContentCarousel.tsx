
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Item {
  id: string;
  title: string;
  image: string;
}

interface ContentCarouselProps {
  title: string;
  items: Item[];
  type: "questions" | "classics" | "icons" | "concepts";
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  items,
  type,
}) => {
  // If there are no items, don't render anything
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg uppercase font-bold">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
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
            >
              <div className="relative h-44 w-32 rounded-md overflow-hidden mb-2">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h4 className="text-sm font-oxanium uppercase line-clamp-2 text-[#2A282A] group-hover:text-[#9b87f5] transition-colors">
                {item.title}
              </h4>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContentCarousel;
