
import React from 'react';
import { motion } from 'framer-motion';

interface MinimalProgressBarProps {
  progress: number;
  currentChapter: string;
  pageInfo: {
    current: number;
    total: number;
    chapterCurrent: number;
    chapterTotal: number;
  };
}

export const MinimalProgressBar: React.FC<MinimalProgressBarProps> = ({ 
  progress, 
  currentChapter,
  pageInfo
}) => {
  return (
    <div className="fixed top-4 left-0 right-0 px-4 z-20 flex flex-col items-center">
      <div className="relative w-full max-w-md h-1 bg-background/20 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-primary/70 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="mt-2 text-xs text-foreground/70 backdrop-blur-sm px-2 py-1 rounded-full bg-background/30">
        <span className="font-light">
          {currentChapter} • Page {pageInfo.chapterCurrent} of {pageInfo.chapterTotal}
        </span>
      </div>
    </div>
  );
};
