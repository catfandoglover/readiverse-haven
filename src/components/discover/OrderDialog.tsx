
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface OrderDialogProps {
  title: string;
  open: boolean;
  onClose: () => void;
  bookId: string;
}

const OrderDialog: React.FC<OrderDialogProps> = ({ title, open, onClose, bookId }) => {
  const handleOrderAmazon = () => {
    window.open(
      `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
      "_blank"
    );
    onClose();
  };

  const handleOrderBarnes = () => {
    window.open(
      `https://www.barnesandnoble.com/s/${encodeURIComponent(title)}`,
      "_blank"
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[#E9E7E2] border-none">
        <DialogHeader>
          <DialogTitle className="text-[#2A282A] font-serif text-xl">
            Order Physical Copy
          </DialogTitle>
          <DialogDescription className="text-[#2A282A]/70">
            Choose where you would like to order a physical copy of {title}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 pt-2">
          <Button
            onClick={handleOrderAmazon}
            className="bg-[#2A282A] hover:bg-[#2A282A]/80 text-white"
          >
            Order from Amazon
          </Button>
          <Button
            onClick={handleOrderBarnes}
            className="bg-[#2A282A] hover:bg-[#2A282A]/80 text-white"
          >
            Order from Barnes & Noble
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#2A282A] text-[#2A282A]"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
