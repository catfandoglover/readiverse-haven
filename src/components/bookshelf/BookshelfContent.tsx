
import React from "react";
import CarouselBooksContent from "./domains/CarouselBooksContent";

const BookshelfContent: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header with border above the heading */}
      <div className="mb-4">
        <div className="border-b border-[#2A282A]/10 mb-4"></div>
        <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2] px-1">
          All Books
        </h2>
      </div>

      {/* Better overflow handling for mobile */}
      <div className="flex-1 overflow-visible">
        <CarouselBooksContent />
      </div>
    </div>
  );
};

export default BookshelfContent;
