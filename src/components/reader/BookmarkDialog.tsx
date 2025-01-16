import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveBookmark: () => void;
  chapterTitle: string | null;
}

const BookmarkDialog = ({
  open,
  onOpenChange,
  onRemoveBookmark,
  chapterTitle
}: BookmarkDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the bookmark from {chapterTitle || 'this chapter'}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRemoveBookmark}
            aria-label="Remove bookmark"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BookmarkDialog;