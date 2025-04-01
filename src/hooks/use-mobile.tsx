
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    // Check if we're on a mobile device based on screen width
    const checkMobile = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
      console.log("[useIsMobile] Detected screen width:", width, "isMobile:", width < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkMobile()
    
    // Set up listener for resize
    window.addEventListener("resize", checkMobile)
    
    // Also check on orientation change which is important for mobile
    window.addEventListener("orientationchange", () => {
      // Add a small delay to ensure the browser has updated its dimensions
      setTimeout(checkMobile, 100)
    })
    
    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [])

  return isMobile
}
