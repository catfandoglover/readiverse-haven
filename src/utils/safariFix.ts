/**
 * Utility functions to handle iOS Safari viewport issues
 */

/**
 * Sets up viewport height CSS variables for proper sizing in mobile Safari
 * This addresses the issue where the Safari browser UI takes up space
 * but isn't accounted for in 100vh calculations
 */
export const setupViewportHeightFix = (): (() => void) => {
  // Calculate the real viewport height and set it as a CSS variable
  const calculateVh = () => {
    // Get the viewport height
    const vh = window.innerHeight;
    // Set it as a CSS variable
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    
    // If Visual Viewport API is available (iOS 13+), use it
    if (window.visualViewport) {
      document.documentElement.style.setProperty('--vw-width', `${window.visualViewport.width}px`);
      document.documentElement.style.setProperty('--vw-height', `${window.visualViewport.height}px`);
    }
  };
  
  // Calculate on init
  calculateVh();
  
  // Recalculate on resize and orientation change
  const handleResize = () => {
    // Small timeout to ensure iOS UI elements have shown/hidden
    setTimeout(calculateVh, 100);
  };
  
  // Handle orientation change specifically
  const handleOrientationChange = () => {
    // Need a longer timeout for orientation changes
    setTimeout(calculateVh, 200);
  };
  
  // Add event listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // For iOS Safari specific issues with the Visual Viewport API
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
  }
  
  // Return cleanup function to remove event listeners
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.visualViewport.removeEventListener('scroll', handleResize);
    }
  };
};

/**
 * Detects if the current browser is Safari
 */
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Detects if the current device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * Determines if the current browser is Mobile Safari
 */
export const isMobileSafari = (): boolean => {
  return isSafari() && isIOS();
};

/**
 * Applies touch-friendly rendering specific to Safari to improve performance
 * @param element The element to apply the optimizations to
 */
export const applySafariTouchOptimizations = (element: HTMLElement): void => {
  if (!element) return;
  
  element.style.WebkitOverflowScrolling = 'touch';
  element.style.WebkitTapHighlightColor = 'rgba(0,0,0,0)';
  element.style.WebkitTouchCallout = 'none';
  element.style.touchAction = 'manipulation';
}; 