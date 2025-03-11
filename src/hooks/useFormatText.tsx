
import React from 'react';

export const useFormatText = () => {
  const formatText = (text: string) => {
    if (!text) return '';
    
    return text.split('\\n').map((line, i) => {
      // Only include key prop without any data-* attributes on React.Fragment
      return (
        <React.Fragment key={i}>
          {line}
          {i < text.split('\\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return { formatText };
};
