
import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import AllBooksContent from "./domains/AllBooksContent";

const BookshelfContent: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Simple header for the All Books section */}
      <div className="mb-4 pb-2 px-1 border-b border-[#2A282A]/10">
        <h2 className="uppercase font-oxanium text-xs font-bold text-[#2A282A]">
          ALL BOOKS
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <AllBooksContent />
      </ScrollArea>
    </div>
  );
};

export default BookshelfContent;
