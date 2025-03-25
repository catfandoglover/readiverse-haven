import React from 'react';

export const useFormatText = () => {
  const formatText = (text: string) => {
    if (!text) return '';
    
    return text.split('\\n').map((line, i) => {
      let processedLine = line;
      
      if (processedLine.startsWith('### ')) {
        return (
          <React.Fragment key={i}>
            <h3 className="text-xl font-bold mb-2 mt-4">
              {processedLine.replace('### ', '')}
            </h3>
            {i < text.split('\\n').length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      processedLine = processedLine.replace(
        /\*(.*?)\*/g, 
        (_, match) => `<strong>${match}</strong>`
      );
      
      processedLine = processedLine.replace(
        /_(.*?)_/g, 
        (_, match) => `<em>${match}</em>`
      );
      
      if (processedLine.includes('<')) {
        return (
          <React.Fragment key={i}>
            <span dangerouslySetInnerHTML={{ __html: processedLine }} />
            {i < text.split('\\n').length - 1 && <br />}
          </React.Fragment>
        );
      }
      
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
