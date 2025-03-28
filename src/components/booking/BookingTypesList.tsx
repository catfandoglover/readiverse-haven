
import React from 'react';
import { useTidyCalAPI, BookingType } from '@/hooks/useTidyCalAPI';
import { AlertTriangle, Loader2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingTypesListProps {
  onSelect?: (bookingType: BookingType) => void;
}

const BookingTypesList: React.FC<BookingTypesListProps> = ({ onSelect }) => {
  const { 
    bookingTypes, 
    bookingTypesLoading, 
    bookingTypesError,
    retryAttempt,
    setRetryAttempt
  } = useTidyCalAPI();

  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
  };

  if (bookingTypesLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#373763]" />
        <p className="mt-4 text-sm text-muted-foreground">Loading booking types...</p>
        <div className="w-full mt-6 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (bookingTypesError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 px-4">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-500 mb-2 text-center">{bookingTypesError}</p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Could not connect to the booking service. Please try again.
        </p>
        <Button 
          variant="outline" 
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!bookingTypes || bookingTypes.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 px-4">
        <Info className="h-8 w-8 text-[#373763] mb-2" />
        <p className="text-sm text-muted-foreground mb-2 text-center">No booking types available.</p>
        <p className="text-sm text-center max-w-md">
          It appears that there are no booking types configured. Please contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold">Available Booking Types</h3>
      <div className="grid gap-4">
        {bookingTypes.map((bookingType) => (
          <div 
            key={bookingType.id} 
            className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSelect && onSelect(bookingType)}
          >
            <h4 className="font-medium">{bookingType.name}</h4>
            <p className="text-sm text-muted-foreground">{bookingType.duration} minutes</p>
            {bookingType.description && (
              <p className="text-sm mt-2">{bookingType.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTypesList;
