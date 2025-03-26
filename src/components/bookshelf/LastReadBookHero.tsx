
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLastReadBook } from "@/hooks/useLastReadBook";
import { Skeleton } from "@/components/ui/skeleton";

const LastReadBookHero = () => {
  const { data: lastReadBook, isLoading } = useLastReadBook();
  const navigate = useNavigate();
  
  const handleResumeReading = () => {
    if (!lastReadBook?.book) return;
    
    const bookSlug = lastReadBook.book.slug || lastReadBook.book.id;
    navigate(`/read/${bookSlug}`, { 
      state: { 
        bookUrl: lastReadBook.book.epub_file_url,
        metadata: {
          Cover_super: lastReadBook.book.Cover_super || lastReadBook.book.cover_url,
          id: lastReadBook.book.id
        }
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 mb-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!lastReadBook?.book) {
    return null;
  }

  const coverUrl = lastReadBook.book.Cover_super || lastReadBook.book.cover_url || 'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png';
  const buttonText = lastReadBook.isDefaultBook ? "RESUME" : "RESUME";

  return (
    <div className="px-4 mb-6">
      <div 
        className="relative h-44 w-full rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleResumeReading}
      >
        {/* Background Image with Blur and Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
        
        {/* "RESUME" Button Text Overlay - Top Left */}
        <div className="absolute top-4 left-6">
          <p className="font-oxanium uppercase text-[E9E7E2]/50 text-xs font-bold">
            {buttonText}
          </p>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-3 flex flex-col justify-end">
          {/* Text Content - Bottom Left */}
          <div className="flex flex-col">
            <h2 className="text-white font-baskerville font-bold text-lg line-clamp-2">
              {lastReadBook.book.title}
            </h2>
            <p className="text-white/80 font-baskerville text-lg mt-1">
              {lastReadBook.book.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastReadBookHero;
