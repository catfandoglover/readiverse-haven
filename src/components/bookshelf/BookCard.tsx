
import React from "react";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  slug?: string;
  epub_file_url?: string;
  useCarouselLayout?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ 
  id, 
  title, 
  author, 
  cover_url, 
  slug,
  epub_file_url,
  useCarouselLayout = false
}) => {
  const navigate = useNavigate();
  const fallbackCoverUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
  
  const handleClick = () => {
    // Only navigate if we have either a slug or epub_file_url
    if (slug || epub_file_url) {
      const bookSlug = slug || id;
      navigate(`/read/${bookSlug}`, { 
        state: { 
          bookUrl: epub_file_url,
          metadata: {
            Cover_super: cover_url
          }
        } 
      });
    }
  };

  if (useCarouselLayout) {
    return (
      <div 
        className="flex flex-col items-center cursor-pointer group h-full"
        onClick={handleClick}
      >
        <div className="relative h-44 w-32 rounded-xl overflow-hidden shadow-md">
          <img
            src={cover_url || fallbackCoverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = fallbackCoverUrl;
            }}
          />
        </div>
        <div className="mt-2 text-center w-full">
          <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
          {author && <p className="text-xs text-[#2A282A]/70 line-clamp-1">{author}</p>}
        </div>
      </div>
    );
  }

  return (
    <div 
      key={id} 
      className="w-full cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
        <img
          src={cover_url || fallbackCoverUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallbackCoverUrl;
          }}
        />
        {/* Add title overlay for visibility on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          {author && <p className="text-white/80 text-sm truncate">{author}</p>}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
