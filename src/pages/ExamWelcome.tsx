
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/OutsetaAuthContext';

const ExamWelcome: React.FC = () => {
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userName = user?.Account?.Name?.split(' ')[0] || 'student';

  useEffect(() => {
    // After 3 seconds, set the animation as done and redirect
    const timer = setTimeout(() => {
      setIsAnimationDone(true);
      navigate('/exam-room');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#3D3D6F] text-[#E9E7E2]">
      <div 
        className={cn(
          "text-center transition-opacity duration-500",
          isAnimationDone ? "opacity-0" : "opacity-100"
        )}
      >
        <h1 className="font-libre-baskerville font-bold text-4xl md:text-5xl mb-4">
          Welcome, {userName}.
        </h1>
        <p className="text-xl font-inter">
          What am I testing you on today?
        </p>
      </div>
    </div>
  );
};

export default ExamWelcome;
