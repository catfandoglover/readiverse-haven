
import React from "react";
import { ProgressDisplay } from "./ProgressDisplay";

interface ProgressTrackerProps {
  bookProgress: number;
  pageInfo: {
    current: number;
    total: number;
    chapterCurrent: number;
    chapterTotal: number;
  };
}

const ProgressTracker = ({ bookProgress, pageInfo }: ProgressTrackerProps) => {
  return (
    <>
      <div className="space-y-2 mb-4">
        <ProgressDisplay 
          progress={bookProgress} 
          label="Book Progress" 
          showLabel={true}
        />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <span>Chapter Page {pageInfo.chapterCurrent} of {pageInfo.chapterTotal}</span>
      </div>
    </>
  );
};

export default ProgressTracker;
