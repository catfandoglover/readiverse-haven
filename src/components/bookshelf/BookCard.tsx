import React from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, Plus, Info } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuPortal 
} from "@/components/ui/dropdown-menu";

interface Shelf {
  id: string;
  name: string;
}

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  slug?: string;
  epub_file_url?: string;
  isDnaBook?: boolean;
  dna_analysis_column?: string;
  userId?: string;
  customShelves?: Shelf[];
  onRemoveBookFromLibrary?: (bookId: string) => void;
  onAddBookToShelf?: (bookId: string, shelfId: string) => void;
  onRemoveBookFromShelf?: (bookId: string) => void;
  shelfFilter?: string;
}

const BookCard: React.FC<BookCardProps> = ({ 
  id, 
  title, 
  author, 
  cover_url, 
  slug,
  epub_file_url,
  isDnaBook = false,
  dna_analysis_column = "",
  userId,
  customShelves = [],
  onRemoveBookFromLibrary,
  onAddBookToShelf,
  onRemoveBookFromShelf,
  shelfFilter
}) => {
  const navigate = useNavigate();
  const fallbackCoverUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
  
  // Log received props for debugging
  console.log(`BookCard Rendered: ID=${id}, Title=${title}, UserID=${userId}`);
  
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

  const handleEllipsisClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      key={id} 
      className="w-full h-full group relative"
    >
      <div 
        className="relative aspect-square w-full rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        <img
          src={cover_url || fallbackCoverUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallbackCoverUrl;
          }}
        />
        
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
      
      {userId && (
        <div className="absolute top-1 left-1 z-10" onClick={handleEllipsisClick}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors" 
                aria-label="Book options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              sideOffset={5} 
              align="start"
              className="bg-[#3F3A46] text-[#E9E7E2] border-[#4E4955] w-48"
              onClick={(e) => e.stopPropagation()}
            >
              {/* See Details Option */} 
              <DropdownMenuItem 
                className="font-oxanium uppercase text-xs tracking-wider cursor-pointer flex items-center focus:bg-[#4E4955]"
                onSelect={() => {
                  const targetPath = slug ? `/texts/${slug}` : `/texts/${id}`;
                  navigate(targetPath);
                }}
              >
                <Info className="h-4 w-4 mr-2" />
                See Details
              </DropdownMenuItem>
              
              {/* Add to Shelf Option */} 
              {customShelves.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="font-oxanium uppercase text-xs tracking-wider cursor-pointer flex items-center focus:bg-[#4E4955]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Shelf
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-[#3F3A46] text-[#E9E7E2] border-[#4E4955]">
                      {customShelves.map((shelf) => (
                        <DropdownMenuItem 
                          key={shelf.id} 
                          className="font-oxanium uppercase text-xs tracking-wider cursor-pointer focus:bg-[#4E4955]"
                          onSelect={() => onAddBookToShelf?.(id, shelf.id)}
                        >
                          {shelf.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}
              
              {/* Unified Remove Option - Logic based on shelfFilter */}
              {!isDnaBook && (shelfFilter === 'all' || (shelfFilter && shelfFilter !== 'dna')) && (
                <DropdownMenuItem 
                  className="font-oxanium uppercase text-xs tracking-wider cursor-pointer text-red-400 focus:bg-red-900/50 focus:text-red-300 flex items-center"
                  onSelect={() => {
                    if (shelfFilter === 'all') {
                      onRemoveBookFromLibrary?.(id);
                    } else if (onRemoveBookFromShelf) {
                      onRemoveBookFromShelf(id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Shelf
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default BookCard;
