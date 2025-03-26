
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLastReadBook } from "@/hooks/useLastReadBook";
import { Button } from "@/components/ui/button";
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
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!lastReadBook?.book) {
    return null;
  }

  const coverUrl = lastReadBook.book.Cover_super || lastReadBook.book.cover_url || 'https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png';
  const buttonText = lastReadBook.isDefaultBook ? "GET STARTED" : "RESUME";

  return (
    <div className="px-4 mb-4">
      <div className="relative h-64 w-full rounded-2xl overflow-hidden">
        {/* Background Image with Blur and Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="flex flex-row items-end space-x-4">
            {/* Cover Image */}
            <div className="w-24 h-36 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={coverUrl} 
                alt={lastReadBook.book.title || "Book cover"} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Text Content */}
            <div className="flex-grow">
              <h2 className="text-white font-bold text-xl line-clamp-2">
                {lastReadBook.book.title}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {lastReadBook.book.author}
              </p>
              
              <Button 
                className="mt-4 bg-white text-black hover:bg-white/90"
                onClick={handleResumeReading}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastReadBookHero;
