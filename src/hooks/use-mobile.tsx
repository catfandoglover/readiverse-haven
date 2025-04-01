import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with undefined to prevent hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to check mobile status based on viewport width
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        const mobileStatus = width < MOBILE_BREAKPOINT
        setIsMobile(mobileStatus)
        console.log("[useIsMobile] Screen width detected:", width, "isMobile:", mobileStatus)
      }
    }
    
    // Initial check on mount
    checkMobile()
    
    // Using matchMedia is more efficient than resize listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // For modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", checkMobile)
    } else {
      // For older browsers
      mql.addListener(checkMobile)
    }
    
    // Handle orientation change events with delay to ensure accurate dimensions
    const handleOrientationChange = () => {
      // The timeout ensures we get the updated dimensions after the orientation change completes
      setTimeout(checkMobile, 150)
    }
    
    window.addEventListener("orientationchange", handleOrientationChange)
    
    return () => {
      // Clean up event listeners
      if (mql.removeEventListener) {
        mql.removeEventListener("change", checkMobile)
      } else {
        // For older browsers
        mql.removeListener(checkMobile)
      }
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])
  
  // Return false as fallback during SSR, actual value after client hydration
  return isMobile ?? false
}