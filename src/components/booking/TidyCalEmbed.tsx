
import React, { useEffect } from 'react';
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
  const [isLoading, setIsLoading] = React.useState(true);
  
  useEffect(() => {
    // Add the script directly in the DOM as per TidyCal's documentation
    const script = document.createElement('script');
    script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js';
    script.async = true;
    
    // Handle script loading completion
    script.onload = () => {
      console.log('TidyCal script loaded');
      setTimeout(() => {
        setIsLoading(false);
        if (onLoad) onLoad();
      }, 1000);
    };

    // Add the script to the document if it doesn't exist yet
    if (!document.querySelector('script[src="https://asset-tidycal.b-cdn.net/js/embed.js"]')) {
      document.body.appendChild(script);
    } else {
      // If script already exists, just mark as loaded
      setIsLoading(false);
      if (onLoad) onLoad();
    }
    
    // Add custom CSS to try to style the TidyCal embed
    const style = document.createElement('style');
    style.textContent = `
      /* Attempt to style TidyCal embed */
      .tidycal-embed {
        --tc-primary-color: #9b87f5 !important;
        --tc-font-family: "Baskerville", serif !important;
        --tc-background-color: transparent !important;
        --tc-text-color: #000000 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up when component unmounts
    return () => {
      // Don't remove the script on unmount as it might be used by other instances
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [onLoad]);
  
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-[#E9E7E2]/50 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#373763] mx-auto mb-4" />
            <p className="text-[#373763]">Loading booking calendar...</p>
          </div>
        </div>
      )}
      
      {/* This is the critical part - render the embed exactly as required by TidyCal */}
      <div 
        className="tidycal-embed" 
        data-path={bookingPath}
        style={{ 
          width: '100%', 
          height: '100%',
          pointerEvents: 'auto',  // Ensure clicks are passed through
          overflow: 'visible'     // Allow content to be visible and scrollable
        }}
      ></div>
    </div>
  );
};

export default TidyCalEmbed;
