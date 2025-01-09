import React from "react";
import { Progress } from "../ui/progress";

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
        <div className="flex justify-between text-sm text-gray-500">
          <span>Book Progress</span>
          <span>{bookProgress}%</span>
        </div>
        <Progress value={bookProgress} className="h-2" />
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>Page {pageInfo.current} of {pageInfo.total}</span>
        <span>Chapter Page {pageInfo.chapterCurrent} of {pageInfo.chapterTotal}</span>
      </div>
    </>
  );
};

export default ProgressTracker;