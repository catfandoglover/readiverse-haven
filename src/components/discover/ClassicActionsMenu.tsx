
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
      <DropdownMenuContent align="end" className="bg-[#E9E7E2]">
        <DropdownMenuItem onClick={toggleFavorite} className="flex items-center gap-2">
          <Star className="h-4 w-4" fill={isFavorite ? "#EFFE91" : "none"} /> 
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOrder} className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" /> Order book
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
          <Share className="h-4 w-4" /> Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClassicActionsMenu;
