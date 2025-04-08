import React, { useState, useEffect, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';

interface VerticalSwiperProps {
  children: ReactNode[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  preloadCount?: number;
}

const VerticalSwiper: React.FC<VerticalSwiperProps> = ({
  children,
  initialIndex = 0,
  onIndexChange,
  preloadCount = 1
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [height, setHeight] = useState(window.innerHeight);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update parent when index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Update height on window resize
  useEffect(() => {
    const updateHeight = () => setHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate which items to render (current + preloaded)
  const visibleIndices = Array.from(
    { length: 2 * preloadCount + 1 },
    (_, i) => currentIndex - preloadCount + i
  ).filter(i => i >= 0 && i < React.Children.count(children));

  // Configure swipe handlers
  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (!isTransitioning && currentIndex < React.Children.count(children) - 1) {
        setIsTransitioning(true);
        setCurrentIndex(prevIndex => prevIndex + 1);
        setTimeout(() => setIsTransitioning(false), 300); // Match transition duration
      }
    },
    onSwipedDown: () => {
      if (!isTransitioning && currentIndex > 0) {
        setIsTransitioning(true);
        setCurrentIndex(prevIndex => prevIndex - 1);
        setTimeout(() => setIsTransitioning(false), 300); // Match transition duration
      }
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false }
  });

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <div 
        className="absolute w-full transition-transform duration-300 ease-out"
        style={{ 
          height: `${React.Children.count(children) * height}px`,
          transform: `translateY(-${currentIndex * height}px)`
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            key={index}
            className="w-full absolute pointer-events-auto"
            style={{ 
              height: `${height}px`, 
              top: `${index * height}px`,
              display: visibleIndices.includes(index) ? 'block' : 'none',
              zIndex: index === currentIndex ? 5 : 1
            }}
            {...(index === currentIndex ? handlers : {})}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation indicators (small dots on the right side) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-50 pointer-events-auto">
        {React.Children.map(children, (_, index) => (
          <div 
            onClick={() => {
              // Add direct click navigation for testing
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 300);
              }
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white/40'
            } cursor-pointer`}
          />
        ))}
      </div>
      
      {/* Add testing controls */}
      <div className="absolute bottom-28 right-3 flex flex-col gap-2 z-50 bg-black/30 p-2 rounded-md pointer-events-auto">
        <div className="text-white text-xs mb-1">Test Controls</div>
        <button
          onClick={() => {
            if (!isTransitioning && currentIndex > 0) {
              setIsTransitioning(true);
              setCurrentIndex(prev => prev - 1);
              setTimeout(() => setIsTransitioning(false), 300);
            }
          }}
          disabled={currentIndex === 0}
          className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs"
        >
          Up (prev)
        </button>
        <button
          onClick={() => {
            if (!isTransitioning && currentIndex < React.Children.count(children) - 1) {
              setIsTransitioning(true);
              setCurrentIndex(prev => prev + 1);
              setTimeout(() => setIsTransitioning(false), 300);
            }
          }}
          disabled={currentIndex === React.Children.count(children) - 1}
          className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs"
        >
          Down (next)
        </button>
      </div>
    </div>
  );
};

export default VerticalSwiper; 