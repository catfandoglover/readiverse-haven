
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
import { ShoppingCart, ExternalLink } from "lucide-react";

interface OrderDialogProps {
  title: string;
  amazonLink?: string;
}

const OrderDialog: React.FC<OrderDialogProps> = ({ title, amazonLink }) => {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-center gap-2 bg-transparent"
        >
          <ShoppingCart className="h-5 w-5" />
          ORDER
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order "{title}"</DialogTitle>
          <DialogDescription>
            Choose where you'd like to purchase this book.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-4 sm:flex-col">
          <Button
            onClick={handleAmazonOrder}
            className="w-full bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm uppercase tracking-wider rounded-2xl flex justify-between items-center"
          >
            Buy on Amazon
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleIndependentOrder}
            className="w-full bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium text-sm uppercase tracking-wider rounded-2xl flex justify-between items-center"
          >
            Buy From Independent Bookseller
            <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
