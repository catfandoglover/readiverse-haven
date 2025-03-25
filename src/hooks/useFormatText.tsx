
import React from 'react';

export const useFormatText = () => {
  const formatText = (text: string | null | undefined): React.ReactNode => {
    if (!text) return null;
    
    // Process text to handle markdown-like syntax
    const parts = text.split(/(\n\n|\n|\*\*.*?\*\*|\*.*?\*|###.*?(?=\n|$))/g);
    
    return parts.map((part, index) => {
      // Handle headers
      if (part.startsWith('###')) {
        return (
          <h3 key={index} className="text-xl font-bold mt-4 mb-2">
            {part.substring(3).trim()}
          </h3>
        );
      }
      
      // Handle bold text
      else if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
      }
      
      // Handle italic text
      else if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.substring(1, part.length - 1)}</em>;
      }
      
      // Handle paragraph breaks
      else if (part === '\n\n') {
        return <br key={index} />;
      }
      
      // Handle line breaks
      else if (part === '\n') {
        return <br key={index} />;
      }
      
      // Return regular text
      else if (part.trim()) {
        return <span key={index}>{part}</span>;
      }
      
      return null;
    });
  };
  
  return { formatText };
};
