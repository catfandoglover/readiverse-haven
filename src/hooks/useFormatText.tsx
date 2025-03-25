import React from 'react';

export const useFormatText = () => {
  const formatText = (text: string) => {
    if (!text) return '';
    
    return text.split('\\n').map((line, i) => {
      // First check if this is a header
      if (line.startsWith('### ')) {
        return (
          <React.Fragment key={i}>
            <h3 className="text-xl font-bold mb-2 mt-4">
              {line.replace('### ', '')}
            </h3>
            {i < text.split('\\n').length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      // Process bold text (*text*)
      let processedLine = line;
      
      // Handle bold text with asterisks
      processedLine = processedLine.replace(
        /\*(.*?)\*/g, 
        (_, match) => `<strong>${match}</strong>`
      );
      
      // Handle italic text with underscores
      processedLine = processedLine.replace(
        /_(.*?)_/g, 
        (_, match) => `<em>${match}</em>`
      );
      
      // If HTML tags were added, use dangerouslySetInnerHTML
      if (processedLine.includes('<')) {
        return (
          <React.Fragment key={i}>
            <span dangerouslySetInnerHTML={{ __html: processedLine }} />
            {i < text.split('\\n').length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      // Otherwise return the text as is
      return (
        <React.Fragment key={i}>
          {processedLine}
          {i < text.split('\\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return { formatText };
};
