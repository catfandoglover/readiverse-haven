
import React from "react";
import { ScrollArea } from "../ui/scroll-area";

const BookshelfContent: React.FC = () => {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-6 p-1">
        <h2 className="font-serif text-xl">Your Library</h2>
        <p className="text-[#2A282A]/80 font-baskerville">
          Your personal collection of books, articles, and other philosophical content will appear here.
        </p>
        <div className="bg-[#2A282A]/5 rounded-lg p-6 text-center">
          <p className="font-baskerville text-[#2A282A]/60">
            Your bookshelf is currently empty. Start exploring the Discover section to find content.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};

export default BookshelfContent;
