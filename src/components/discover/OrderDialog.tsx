
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
      <DialogContent className="sm:max-w-[425px] bg-[#2A282A] text-[#E9E7E2] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl">Order "{title}"</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose where you'd like to purchase this book.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleAmazonOrder}
            className="w-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black flex justify-between items-center"
          >
            Buy on Amazon
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleIndependentOrder}
            className="w-full bg-[#4C7C9B] hover:bg-[#4C7C9B]/90 flex justify-between items-center"
          >
            Buy From Independent Bookseller
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
