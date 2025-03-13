
import React from "react";
import { Book } from "lucide-react";

const BookshelfContent: React.FC = () => {
  // Mock data - would be replaced with real data in production
  const emptyState = true;

  return (
    <div className="h-full flex flex-col">
      {emptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Book className="w-16 h-16 text-[#2A282A]/30 mb-4" />
          <h3 className="text-xl font-semibold text-[#2A282A]">Your bookshelf is empty</h3>
          <p className="text-[#2A282A]/70 text-center mt-2 max-w-md">
            Start exploring the library to add books to your shelf
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {/* Book items would go here */}
        </div>
      )}
    </div>
  );
};

export default BookshelfContent;
