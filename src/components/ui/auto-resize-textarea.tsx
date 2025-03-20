
import React, { useState, useRef, useEffect, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './textarea';

export interface AutoResizeTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 1, maxRows = 5, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [content, setContent] = useState(props.value || '');
    
    // Merge the forwarded ref with our local ref
    const assignRef = (element: HTMLTextAreaElement) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    // Adjust height of textarea based on content
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to recalculate
      textarea.style.height = 'auto';
      
      // Calculate the line height based on font size
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.2;
      
      // Calculate min and max heights
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      
      // Set the height based on scrollHeight, constrained between min and max
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(Math.max(minHeight, scrollHeight), maxHeight)}px`;
      
      // Set overflow if content exceeds max height
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [content, minRows, maxRows]);

    return (
      <Textarea
        ref={assignRef}
        className={cn(
          "resize-none overflow-hidden transition-height duration-100 py-2.5",
          className
        )}
        onChange={handleChange}
        rows={minRows}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export { AutoResizeTextarea };
