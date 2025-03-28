
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TidyCalEmbedProps {
  bookingPath: string;
  height?: string;
  className?: string;
  onLoad?: () => void;
}

const TidyCalEmbed: React.FC<TidyCalEmbedProps> = ({ 
  bookingPath, 
  height = '700px',
  className = '',
  onLoad
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset loading state when booking path changes
    setIsLoading(true);
    setError(null);
    
    // Only load the script once
    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js';
      script.async = true;
      
      script.onload = () => {
        console.log('TidyCal script loaded successfully');
        scriptLoaded.current = true;
        if (window.TidyCal) {
          window.TidyCal.init();
        }
        // We'll still wait for the observer to detect when content is fully loaded
      };
      
      script.onerror = () => {
        console.error('Failed to load TidyCal script');
        setError('Failed to load the booking calendar. Please try again later.');
        setIsLoading(false);
      };
      
      document.body.appendChild(script);
    } else if (window.TidyCal) {
      // If script is already loaded, initialize tidycal again
      window.TidyCal.init();
    }

    // Create a MutationObserver to detect when TidyCal has fully loaded
    const observer = new MutationObserver((mutations) => {
      // Check if TidyCal has added content to our container
      if (containerRef.current && containerRef.current.children.length > 0) {
        console.log('TidyCal content detected in container');
        setIsLoading(false);
        if (onLoad) onLoad();
        observer.disconnect();
      }
    });

    // Start observing our container for changes
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    // Set a timeout to handle cases where the observer doesn't detect changes
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Timeout reached, assuming TidyCal is loaded');
        setIsLoading(false);
        if (onLoad) onLoad();
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [bookingPath, onLoad, isLoading]);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      {isLoading && (
        <div className="flex justify-center items-center h-full bg-[#E9E7E2]/50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#373763] mx-auto mb-4" />
            <p className="text-[#373763]">Loading booking calendar...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex justify-center items-center h-full bg-red-50 text-red-500 p-4">
          <p>{error}</p>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="tidycal-embed"
        data-path={bookingPath}
        style={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          display: isLoading || error ? 'none' : 'block'
        }}
      ></div>
    </div>
  );
};

export default TidyCalEmbed;
