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
    </div>
  );
};

export default VerticalSwiper; 