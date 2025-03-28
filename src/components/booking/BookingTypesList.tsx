
import React from 'react';
import { useTidyCalAPI, BookingType } from '@/hooks/useTidyCalAPI';
import { AlertTriangle, Loader2, Info, Wifi, WifiOff, RefreshCw } from 'lucide-react';
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
    setRetryAttempt,
    healthCheck,
    fetchBookingTypes
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

  if (healthCheck === false) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 px-4">
        <WifiOff className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-lg font-medium mb-2 text-center">Connection Issue</p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Can't connect to the booking service right now. Using backup data.
        </p>
        <Button 
          variant="outline" 
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (bookingTypesError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 px-4">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-500 mb-2 text-center">{bookingTypesError}</p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Could not connect to the booking service. We'll use backup data so you can still proceed.
        </p>
        <Button 
          variant="outline" 
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
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
          It appears that there are no booking types configured. Please try refreshing or contact support.
        </p>
        <Button 
          variant="outline" 
          onClick={handleRetry}
          className="flex items-center gap-2 mt-4"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Booking Types</h3>
        {healthCheck === true && (
          <div className="flex items-center text-sm text-green-600">
            <Wifi className="h-4 w-4 mr-1" />
            <span>Online</span>
          </div>
        )}
      </div>
      
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
