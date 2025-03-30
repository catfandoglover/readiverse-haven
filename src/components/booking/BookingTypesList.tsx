
import React from 'react';
import { Clock, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTidyCalAPI, BookingType } from '@/hooks/useTidyCalAPI';

interface BookingTypesListProps {
  onSelect: (bookingType: BookingType) => void;
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

  if (bookingTypesError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="font-semibold text-lg mb-2">Connection Error</h3>
        <p className="text-sm text-gray-600 mb-4">
          We're having trouble connecting to the booking service. Please try again later.
        </p>
        <Button 
          onClick={handleRetry} 
          disabled={bookingTypesLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {bookingTypesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Retry Connection
        </Button>
      </div>
    );
  }

  if (bookingTypesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
        <p className="text-sm text-gray-600">Loading booking options...</p>
      </div>
    );
  }

  if (!bookingTypes || bookingTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          No booking types are currently available.
        </p>
        <Button onClick={handleRetry} variant="outline">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookingTypes.map((type) => (
        <div 
          key={type.id}
          className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onSelect(type)}
        >
          <h3 className="font-semibold text-lg">{type.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-2 mb-1">
            <Clock className="h-4 w-4 mr-2" />
            <span>{type.duration} minutes</span>
          </div>
          {type.price && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>${type.price} {type.currency}</span>
            </div>
          )}
          {type.description && (
            <p className="mt-3 text-sm text-gray-600" 
               dangerouslySetInnerHTML={{ __html: type.description }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingTypesList;
