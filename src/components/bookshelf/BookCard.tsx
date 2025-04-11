import React from "react";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  slug?: string;
  epub_file_url?: string;
  isDnaBook?: boolean;
  dna_analysis_column?: string;
}

const BookCard: React.FC<BookCardProps> = ({ 
  id, 
  title, 
  author, 
  cover_url, 
  slug,
  epub_file_url,
  isDnaBook = false,
  dna_analysis_column = ""
}) => {
  const navigate = useNavigate();
  const fallbackCoverUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
  
  // Determine whether this is a kindred spirit or challenging voice
  const getDnaBookType = () => {
    if (!dna_analysis_column) return null;
    
    if (dna_analysis_column.includes('kindred_spirit')) {
      return 'KINDRED SPIRIT';
    } else if (dna_analysis_column.includes('challenging_voice')) {
      return 'CHALLENGING VOICE';
    }
    
    return null;
  };
  
  const dnaBookType = getDnaBookType();
  
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

  return (
    <div 
      key={id} 
      className="w-full h-full cursor-pointer group"
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
        
        {/* DNA relationship pill */}
        {isDnaBook && dnaBookType && (
          <div className={`absolute top-2 right-2 rounded-2xl px-3 leading-none flex items-center h-3 backdrop-blur-sm ${
            dnaBookType === 'KINDRED SPIRIT' 
              ? 'bg-[#1D3A35]/90' 
              : 'bg-[#301630]/90'
          }`}>
            <span className="font-oxanium italic uppercase text-[10px] tracking-tight text-white whitespace-nowrap">
              {dnaBookType}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
