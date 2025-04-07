/**
 * Utility functions to handle iOS Safari viewport issues
 */

/**
 * Sets up viewport height CSS variables for proper sizing in mobile Safari
 * This addresses the issue where the Safari browser UI takes up space
 * but isn't accounted for in 100vh calculations
 */
export const setupViewportHeightFix = (): (() => void) => {
  // Detect browser types
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /chrome/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Set appropriate browser chrome height
  const getBrowserChromeHeight = () => {
    if (isIOS) {
      if (isSafari) {
        return 80; // Safari has larger UI elements
      } else if (isChrome) {
        return 60; // Chrome has medium UI elements
      } else {
        return 70; // Default for other iOS browsers
      }
    }
    return 0; // Non-iOS browsers
  };
  
  // Calculate the real viewport height and set it as a CSS variable
  const calculateVh = () => {
    // Get the viewport height
    const vh = window.innerHeight;
    
    // Get browser chrome height
    const chromeHeight = getBrowserChromeHeight();
    
    // Set all variables
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    document.documentElement.style.setProperty('--browser-nav-height', `${chromeHeight}px`);
    
    // If Visual Viewport API is available (iOS 13+), use it for more accuracy
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
 * Determines if the current browser is Chrome on iOS
 */
export const isIOSChrome = (): boolean => {
  const isChrome = /CriOS/i.test(navigator.userAgent);
  return isIOS() && isChrome;
};

/**
 * Get the estimated height of browser UI elements
 */
export const getBrowserUIHeight = (): number => {
  if (isIOS()) {
    if (isSafari()) {
      return 80; // Safari has larger UI
    } else if (isIOSChrome()) {
      return 60; // Chrome has medium UI
    } else {
      return 70; // Default for other browsers
    }
  }
  return 0; // No adjustment needed
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