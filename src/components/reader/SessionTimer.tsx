import React from 'react';

interface SessionTimerProps {
  seconds: number;
}

const SessionTimer = ({ seconds }: SessionTimerProps) => {
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
    <div className="fixed bottom-4 right-4 z-50 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border-0">
      Reading time: {formatTime(seconds)}
    </div>
  );
};

export default SessionTimer;