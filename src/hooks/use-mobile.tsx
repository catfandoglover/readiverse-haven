
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with a default value based on current width to prevent flicker
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Only check window in browser environment
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // Default to desktop during SSR
    return false;
  });

  React.useEffect(() => {
    // Function to check mobile status based on viewport width
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const mobileStatus = width < MOBILE_BREAKPOINT;
        setIsMobile(mobileStatus);
        console.log("[useIsMobile] Screen width detected:", width, "isMobile:", mobileStatus);
      }
    }
    
    // Force immediate check on component mount
    checkMobile();
    
    // Using matchMedia is more efficient than resize listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Define a handler that updates state when media query changes
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      console.log("[useIsMobile] Media query change:", e.matches);
    };
    
    // Initial check
    handleMediaChange(mql);
    
    // For modern browsers
    if ('addEventListener' in mql) {
      mql.addEventListener("change", handleMediaChange);
    } else {
      // For older browsers
      // @ts-ignore - TypeScript doesn't know about addListener on older browsers
      mql.addListener(handleMediaChange);
    }
    
    // Handle orientation change events with delay to ensure accurate dimensions
    const handleOrientationChange = () => {
      // The timeout ensures we get the updated dimensions after the orientation change completes
      setTimeout(checkMobile, 150);
    }
    
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", checkMobile);
    
    return () => {
      // Clean up event listeners
      if ('removeEventListener' in mql) {
        mql.removeEventListener("change", handleMediaChange);
      } else {
        // For older browsers
        // @ts-ignore - TypeScript doesn't know about removeListener on older browsers
        mql.removeListener(handleMediaChange);
      }
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", checkMobile);
    }
  }, []);
  
  return isMobile;
}
