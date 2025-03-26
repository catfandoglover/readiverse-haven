
import React, { useState } from "react";
import { Grid2X2, List } from "lucide-react";
import BookCard from "../bookshelf/BookCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Book {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  slug?: string;
  epub_file_url?: string;
}

interface BookCarouselProps {
  books: Book[];
  isLoading: boolean;
}

const BookCarousel: React.FC<BookCarouselProps> = ({ books, isLoading }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (books.length === 0) {
    return (
      <div className="text-center py-10 text-[#E9E7E2]/70">
        <p>No books in your collection yet.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-oxanium text-[#E9E7E2] uppercase">All Books</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${
              viewMode === "grid" ? "bg-[#E9E7E2]/20" : "text-[#E9E7E2]/50"
            }`}
            aria-label="Grid view"
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list" ? "bg-[#E9E7E2]/20" : "text-[#E9E7E2]/50"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {books.map((book) => (
              <CarouselItem key={book.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  cover_url={book.cover_url}
                  slug={book.slug}
                  epub_file_url={book.epub_file_url}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-[#E9E7E2]/10 text-[#E9E7E2] hover:bg-[#E9E7E2]/20 border-none" />
          <CarouselNext className="right-2 bg-[#E9E7E2]/10 text-[#E9E7E2] hover:bg-[#E9E7E2]/20 border-none" />
        </Carousel>
      ) : (
        <div className="space-y-4 p-1">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex items-center space-x-4 rounded-lg bg-[#E9E7E2]/10 p-3 cursor-pointer hover:bg-[#E9E7E2]/15 transition-colors"
              onClick={() => {
                if (book.slug || book.epub_file_url) {
                  // Use existing navigation logic from BookCard
                  window.location.href = `/read/${book.slug || book.id}`;
                }
              }}
            >
              <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                <img
                  src={book.cover_url || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png"}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[#E9E7E2] font-medium truncate">{book.title}</h4>
                {book.author && (
                  <p className="text-[#E9E7E2]/70 text-sm truncate">{book.author}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookCarousel;
