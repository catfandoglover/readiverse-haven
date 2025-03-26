
import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookCard from "../bookshelf/BookCard";

interface Book {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  slug?: string;
  epub_file_url?: string;
}

interface ShelfSectionProps {
  title: string;
  books: Book[];
  isLoading: boolean;
  viewAllLink?: string;
  limit?: number;
}

const ShelfSection: React.FC<ShelfSectionProps> = ({ 
  title, 
  books, 
  isLoading, 
  viewAllLink,
  limit = 4
}) => {
  const navigate = useNavigate();
  
  const handleViewAll = () => {
    if (viewAllLink) {
      navigate(viewAllLink);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-oxanium text-[#E9E7E2] uppercase">{title}</h3>
        {viewAllLink && (
          <button 
            onClick={handleViewAll}
            className="flex items-center text-[#E9E7E2]/70 hover:text-[#E9E7E2] text-sm"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {books.slice(0, limit).map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            cover_url={book.cover_url}
            slug={book.slug}
            epub_file_url={book.epub_file_url}
          />
        ))}
      </div>
    </div>
  );
};

export default ShelfSection;
