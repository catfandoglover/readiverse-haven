
import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '@/assets/lightning-loading.json';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="w-24 h-24">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <span className="font-oxanium text-lg text-foreground">Loading</span>
    </div>
  );
};
