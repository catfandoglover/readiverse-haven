
import React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Amazon, BookOpenText, Store } from "lucide-react";

interface OrderDialogProps {
  bookId: string;
  title: string;
  coverUrl: string;
  amazonUrl: string;
  bookshopUrl: string;
  onClose: () => void;
  open: boolean;
}

const OrderDialog: React.FC<OrderDialogProps> = ({
  bookId,
  title,
  coverUrl,
  amazonUrl,
  bookshopUrl,
  onClose,
  open
}) => {
  const visitAmazon = () => {
    // Open Amazon link in a new tab
    if (amazonUrl) {
      window.open(amazonUrl, '_blank');
    }
    onClose();
  };

  const visitBookshop = () => {
    // Open Bookshop link in a new tab
    if (bookshopUrl) {
      window.open(bookshopUrl, '_blank');
    }
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-xl">Order "{title}"</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <div className="flex justify-center mb-4">
              {coverUrl && (
                <img 
                  src={coverUrl} 
                  alt={title} 
                  className="h-40 w-auto object-contain rounded shadow-md"
                />
              )}
            </div>
            <p className="text-sm text-gray-600">
              Choose where you'd like to order this book from
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col space-y-2 sm:space-y-0">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 border-yellow-500 hover:bg-yellow-50"
            onClick={visitAmazon}
          >
            <Amazon className="h-4 w-4" />
            <span>Amazon</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 border-teal-600 hover:bg-teal-50"
            onClick={visitBookshop}
          >
            <Store className="h-4 w-4" />
            <span>Bookshop.org</span>
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="mt-2"
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderDialog;
