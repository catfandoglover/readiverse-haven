
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink, X } from "lucide-react";

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
      <DialogContent className="w-[80%] max-w-lg bg-[#E9E7E2] p-6 rounded-2xl">
        <DialogHeader className="flex flex-col space-y-1.5 text-left pt-10">
          <DialogTitle className="text-3xl font-baskerville leading-none tracking-tight text-black font-bold">
            Order "{title}"
          </DialogTitle>
          <DialogDescription className="text-sm font-oxanium mt-3 text-muted-foreground">
            Choose where you'd like to purchase this book.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col space-y-4 mt-5">
          <Button
            onClick={handleAmazonOrder}
            className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12 w-full flex justify-between items-center"
          >
            Buy on Amazon
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleIndependentOrder}
            className="bg-[#E9E7E2]/50 text-[#373763] hover:bg-[#E9E7E2] hover:text-[#373763] font-oxanium text-sm font-bold uppercase tracking-wider rounded-2xl h-12 border border-[#373763]/20 w-full flex justify-between items-center"
          >
            Buy From Independent Bookseller
            <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
        
        <DialogClose className="absolute right-6 top-6 rounded-full h-8 w-8 flex items-center justify-center opacity-70 hover:opacity-100 focus:outline-none disabled:pointer-events-none">
          <X className="h-6 w-6 text-black" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
