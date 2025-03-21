
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface OrderDialogProps {
  title: string;
  amazonLink?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const OrderDialog: React.FC<OrderDialogProps> = ({ 
  title, 
  amazonLink,
  open,
  onOpenChange
}) => {
  const handleAmazonOrder = () => {
    if (amazonLink) {
      window.open(amazonLink, '_blank');
    } else {
      window.open(`https://www.amazon.com/s?k=${encodeURIComponent(title)}`, '_blank');
    }
  };

  const handleIndependentOrder = () => {
    window.open(`https://bookshop.org/search?keywords=${encodeURIComponent(title)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] sm:w-[80%] max-w-md bg-[#E9E7E2] p-6 rounded-2xl">
        <DialogHeader className="flex flex-col space-y-1.5 text-left pt-10">
          <DialogTitle className="text-3xl font-baskerville leading-none tracking-tight text-black font-bold">
            Order "{title}"
          </DialogTitle>
          <DialogDescription className="text-sm font-oxanium mt-3 text-muted-foreground">
            Choose where you'd like to purchase this book.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 mt-5 w-full overflow-hidden">
          <Button
            onClick={handleAmazonOrder}
            className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12 w-full flex items-center justify-center px-4"
          >
            <span className="truncate mr-1">Amazon</span>
            <ExternalLink className="h-4 w-4 flex-shrink-0 ml-1 mb-0.5" />
          </Button>
          <Button
            onClick={handleIndependentOrder}
            className="bg-[#E9E7E2]/50 text-[#373763] hover:bg-[#E9E7E2] hover:text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12 border border-[#373763]/20 w-full flex items-center justify-center px-4"
          >
            <span className="truncate mr-1">Independent Booksellers</span>
            <ExternalLink className="h-4 w-4 flex-shrink-0 ml-1 mb-0.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
