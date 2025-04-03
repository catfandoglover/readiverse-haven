import React from 'react';
import { MoreHorizontal, Star, ShoppingCart, Share } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface ClassicActionsMenuProps {
  isFavorite: boolean;
  toggleFavorite: (e: React.MouseEvent) => void;
  handleOrder: () => void;
  handleShare: () => void;
  shouldBlurHeader: boolean;
}

const ClassicActionsMenu: React.FC<ClassicActionsMenuProps> = ({
  isFavorite,
  toggleFavorite,
  handleOrder,
  handleShare,
  shouldBlurHeader,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "h-10 w-10 inline-flex items-center justify-center rounded-md transition-colors",
            shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
          )}
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "flex flex-col p-0 border-none shadow-lg w-auto min-w-0",
          shouldBlurHeader ? "backdrop-blur-md bg-[#E9E7E2]/80" : "backdrop-blur-md bg-black/30"
        )}
      >
        <DropdownMenuItem 
          onClick={toggleFavorite} 
          className={cn(
            "flex items-center justify-center h-10 w-10 p-0 m-1 rounded-md transition-colors self-end",
            shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
          )}
        >
          <Star className="h-5 w-5" fill={isFavorite ? "#EFFE91" : "none"} />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleOrder} 
          className={cn(
            "flex items-center justify-center h-10 w-10 p-0 m-1 rounded-md transition-colors self-end",
            shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
          )}
        >
          <ShoppingCart className="h-5 w-5" />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleShare} 
          className={cn(
            "flex items-center justify-center h-10 w-10 p-0 m-1 rounded-md transition-colors self-end",
            shouldBlurHeader ? "text-[#2A282A] hover:bg-[#2A282A]/10" : "text-white hover:bg-white/10"
          )}
        >
          <Share className="h-5 w-5" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClassicActionsMenu;
