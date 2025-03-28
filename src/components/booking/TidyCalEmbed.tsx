
import React, { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create and append the script element
    const script = document.createElement('script');
    script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js';
    script.async = true;
    
    // Set up a listener to detect when TidyCal has finished loading
    const handleScriptLoad = () => {
      console.log('TidyCal script loaded');
      
      // Set a timeout to allow TidyCal to render
      const timeout = setTimeout(() => {
        setIsLoading(false);
        if (onLoad) onLoad();
      }, 1500);
      
      return () => clearTimeout(timeout);
    };
    
    script.onload = handleScriptLoad;
    
    // Append the script to the document
    document.body.appendChild(script);
    
    // Clean up when component unmounts
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onLoad]);
  
  return (
    <div className={`w-full ${className}`} style={{ height, position: 'relative' }}>
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-[#E9E7E2]/50 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#373763] mx-auto mb-4" />
            <p className="text-[#373763]">Loading booking calendar...</p>
          </div>
        </div>
      )}
      
      {/* TidyCal embed div - exactly as per documentation */}
      <div 
        ref={containerRef}
        className="tidycal-embed" 
        data-path={bookingPath}
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }}
      ></div>
    </div>
  );
};

export default TidyCalEmbed;
