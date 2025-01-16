import React from 'react';
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionTimerProps {
  seconds: number;
  className?: string;
  showIcon?: boolean;
}

const SessionTimer = ({ seconds, className, showIcon = true }: SessionTimerProps) => {
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

  if (showIcon) {
    return (
      <Clock className="h-4 w-4" />
    );
  }

  return (
    <div className={className}>
      Reading time: {formatTime(seconds)}
    </div>
  );
};

export default SessionTimer;