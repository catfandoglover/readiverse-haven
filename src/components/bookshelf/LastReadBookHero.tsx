import React from "react";
import { useNavigate } from "react-router-dom";
import { useLastReadBook } from "@/hooks/useLastReadBook";
import { Skeleton } from "@/components/ui/skeleton";

const LastReadBookHero = () => {
  const { data: lastReadBook, isLoading } = useLastReadBook();
  const navigate = useNavigate();
  
  console.log('LastReadBookHero - lastReadBook:', lastReadBook);
  
  const handleResumeReading = () => {
    if (!lastReadBook?.book) return;
    
    const bookSlug = lastReadBook.book.slug || lastReadBook.book.id;
    console.log('LastReadBookHero - Navigating to book:', bookSlug, lastReadBook.book);
    
    navigate(`/read/${bookSlug}`, { 
      state: { 
        bookUrl: lastReadBook.book.epub_file_url,
        metadata: {
          Cover_super: lastReadBook.book.cover_url || lastReadBook.book.Cover_super,
          id: lastReadBook.book.id
        }
      } 
    });
  };

  if (isLoading) {
    return (
      <Skeleton className="h-52 w-full rounded-2xl" />
    );
  }

  if (!lastReadBook?.book) {
    console.log('LastReadBookHero - No book found, returning null');
    return null;
  }

  // Prefer icon_illustration over cover_url
  const heroImageUrl = lastReadBook.book.icon_illustration || lastReadBook.book.cover_url || lastReadBook.book.Cover_super || 'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png';
  const buttonText = lastReadBook.isDefaultBook ? "RESUME" : "RESUME";
  
  console.log('LastReadBookHero - Using hero image URL:', heroImageUrl);

  return (
    <div className="relative h-52 w-full rounded-2xl overflow-hidden cursor-pointer" onClick={handleResumeReading}>
      {/* Background Image with Blur and Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover"
        style={{ 
          backgroundImage: `url(${heroImageUrl})`,
          backgroundPosition: 'center 15%' // Position from 15% down from the top
        }}
      />
      <div className="absolute inset-0 bg-black/45" />
      
      {/* "RESUME" Button Text Overlay - Top Left */}
      <div className="absolute top-6 left-6">
        <p className="font-oxanium uppercase text-[#E9E7E2]/50 text-xs font-bold tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
          {buttonText}
        </p>
      </div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        {/* Text Content - Bottom Left */}
        <div className="flex flex-col">
          <h2 className="text-[#E9E7E2] font-libre-baskerville font-bold text-lg line-clamp-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
            {lastReadBook.book.title}
          </h2>
          <p className="text-[#E9E7E2]/80 font-libre-baskerville text-lg mt-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
            {lastReadBook.book.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LastReadBookHero;
