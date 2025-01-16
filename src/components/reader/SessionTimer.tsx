import React, { useState } from 'react';
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionTimerProps {
  seconds: number;
  className?: string;
}

const SessionTimer = ({ seconds, className }: SessionTimerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {isVisible && (
          <div className="bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border-0">
            Reading time: {formatTime(seconds)}
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsVisible(!isVisible)}
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SessionTimer;