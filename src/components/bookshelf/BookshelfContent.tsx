
import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import CarouselBooksContent from "./domains/CarouselBooksContent";

const BookshelfContent: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header with border above the heading */}
      <div className="mb-4">
        <div className="border-b border-[#2A282A]/10 mb-2"></div>
        <h2 className="uppercase font-baskerville text-lg font-bold text-[#E9E7E2] px-1">
          ALL BOOKS
        </h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <CarouselBooksContent />
      </div>
    </div>
  );
};

export default BookshelfContent;
